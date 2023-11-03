import { UserModel } from '@models';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const userCount = await UserModel.count({
        where: {
            role: 'user'
        }
    })

    res.status(200).json({
        success: true,
        data: {
            userCount
        },
        message: ""
    })
}