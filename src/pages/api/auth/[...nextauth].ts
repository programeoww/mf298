import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { Session } from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import { UserModel } from '@models';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
                        id: user.dataValues.id.toString(),
                        accessToken: jwt.sign({ sub: user.dataValues.id.toString() }, process.env.JWT_SECRET!, { expiresIn: '30d' })
                    }
                }

                return null;
            } catch (error) {
                return null;
            }
        },
    })
]

const callbacks = {
    jwt: async ({ token, user } : { token: any, user?: any }) => {
        if(user){
            token.accessToken = user.accessToken;
        }

        return Promise.resolve(token);
    },
    session: async ({ session, token } : { session: Session, token: any }) => {
        try {
            const user = await UserModel.findOne({
                where: {
                    id: token.sub
                },
                attributes: ['id', 'name', 'phone', 'role', 'participateAs', 'localUnit', 'address']
            });

            if(user) {
                session.user = user;
                session.accessToken = token.accessToken;
            }else{
                session.user = undefined;
                session.accessToken = undefined;
                return Promise.resolve(session);
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
    },
}

const Auth = (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, options)
export default Auth;