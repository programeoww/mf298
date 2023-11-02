import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { Session } from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import { UserModel } from '@models';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';

const providers = [
    CredentialsProvider({
        name: 'Credentials',
        credentials: {
            phone: { label: "Phone", type: "text" },
            password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
            try {
                if(!credentials || !credentials.phone || !credentials.password) return null;

                const user = await UserModel.findOne({
                    where: {
                        [Op.or]: [
                            { phone: credentials.phone }
                        ]
                    },
                    attributes: ['id', 'password']
                });

                if(!user) return null;

                const comparePassword = await bcrypt.compare(credentials.password, user.password);
                if(!comparePassword) return null;
    
                if (user) {
                    return {
                        id: user.dataValues.id.toString()
                    }
                }

                return null;
            } catch (error) {
                // Return null if user data could not be retrieved
                return null;
            }
        },
    })
]

const callbacks = {
    session: async ({ session, token } : { session: Session, token: { sub?: string | undefined } }) => {
        try {
            const user = await UserModel.findOne({
                where: {
                    id: token.sub
                },
                attributes: ['id', 'name', 'phone', 'role']
            });

            if(user) {
                session.user = user;
            }
        } catch (error) {
            return Promise.resolve(session);
        }
        return Promise.resolve(session)
    },
}

export const options = {
    providers,
    callbacks,
    pages: {
        signIn: '/dang-nhap',
    },
    secret: process.env.JWT_SECRET,
    session:{
        maxAge: 30 * 24 * 60 * 60, // 30 days
    }
}

const Auth = (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, options)
export default Auth;