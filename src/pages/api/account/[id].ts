import { NextApiRequest, NextApiResponse } from "next";
import jwt from 'jsonwebtoken';
import { UserModel } from "@models";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === "PATCH"){
        const user = await UserModel.findOne({
            where: {
                id: req.query.id
            },
            attributes: ['id', 'name', 'birthday', 'phone', 'participateAs', 'localUnit', 'subLocalUnit', 'address', 'role']
        })

        if(!user){
            return res.status(200).json({
                success: false,
                message: 'Update user failed',
                errors: [
                    {
                        path: 'name',
                        message: 'Không tìm thấy người dùng'
                    }
                ]
            })
        }

        const authHeader = req.headers.authorization?.split(" ")[1] || "";

        const decodedToken = jwt.verify(authHeader, process.env.JWT_SECRET!);

        const isAdminUser = await UserModel.findOne({
            where: {
                id: (decodedToken as {sub: string | number, iat: number, exp: number} ).sub,
                role: 'admin'
            }
        })

        if(((decodedToken as {sub: string | number, iat: number, exp: number} ).sub == user.getDataValue('id')) || isAdminUser){
            const updateData = Object.keys(req.body).reduce((acc, key) => {
                if(req.body[key] !== ""){
                    acc[key] = req.body[key]
                }
                return acc;
            }, {} as any)

            await user.update(updateData)
        }

        res.json({
            success: true,
            data: user,
            message: "Update user successfully"
        })
    }else if(req.method === "DELETE"){
        const user = await UserModel.findOne({
            where: {
                id: req.query.id
            }
        })

        if(!user){
            return res.status(200).json({
                success: false,
                message: 'Delete user failed',
                errors: [
                    {
                        path: 'name',
                        message: 'Không tìm thấy người dùng'
                    }
                ]
            })
        }

        await user.destroy();

        res.json({
            success: true,
            message: "Delete user successfully"
        })
    }
}