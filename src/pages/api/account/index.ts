import { UserModel } from "@models";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === "GET"){
        const user = await UserModel.findAll({
            attributes: ['id', 'name', 'phone', 'address', 'localUnit', 'role']
        })

        res.json({
            success: true,
            data: user,
            message: "Get user successfully"
        })
    }
}