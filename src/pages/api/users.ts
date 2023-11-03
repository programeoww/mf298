import { IUser, QuizAttemptModel, UserModel } from '@models';
import { NextApiRequest, NextApiResponse } from 'next';
import { Model, Op } from 'sequelize';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { pageIndex = 0, pageSize = 10 } = req.query;

    const authHeader = req.headers.authorization?.split(" ")[1] || "";

    try{
        // const decodedToken = jwt.verify(authHeader, process.env.JWT_SECRET!);

        // const isAdminUser = await UserModel.findOne({
        //     where: {
        //         id: (decodedToken as {id: string | number, iat: number, exp: number} ).id,
        //         role: 'admin'
        //     }
        // })
    
        // if(!isAdminUser){
        //     return res.status(200).json({
        //         success: false,
        //         message: 'Not authorized',
        //         errors: []
        //     })
        // }
    
        const users = await UserModel.findAll({
            include: {
                model: QuizAttemptModel,
                as: 'quiz_attempts',
                attributes: ['id', 'file_path'],
                where: {
                    // file_path: {
                    //     [Op.not]: ""
                    // }
                },
            },
            attributes: ['id', 'name', 'phone', 'address','role', 'localUnit'],
            where: {
                [Op.not]: {
                    phone: '0862661506',
                    name: 'root'
                }
            },
            // limit: Number(pageSize),
            // offset: Number(pageIndex) * Number(pageSize),
            order: [
                [{ model: QuizAttemptModel, as: 'quiz_attempts' }, 'file_path', 'DESC'],
            ]
        });
    
        // console.log(users);
    
        // mappedUsers.sort((a, b) => {
        //     if(a.getDataValue('quiz_attempts')!.length > b.getDataValue('quiz_attempts')!.length) return -1;
        //     if(a.getDataValue('quiz_attempts')!.length < b.getDataValue('quiz_attempts')!.length) return 1;
        //     return 0;
        // })
    
        const total = await UserModel.count({
            where: {
                [Op.not]: {
                    phone: '0862661506',
                    name: 'root'
                }
            }
        })
    
        res.json({
            success: true,
            data: {
                users: users,
                total,
            },
            message: "Get users successfully"
        })
    }catch(err){
        return res.status(200).json({
            success: false,
            message: 'Not authorized',
            errors: []
        })
    }
}