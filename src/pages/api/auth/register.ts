import { NextApiRequest, NextApiResponse } from 'next';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { UserModel } from '@models';
import { ApiResponseData } from '@/interfaces';

const schema = Joi.object({
    name: Joi.string().required(),
    birthday: Joi.number().required(),
    password: Joi.string().required(),
    phone: Joi.string().required(),
    participateAs: Joi.string().required(),
    localUnit: Joi.string().required(),
    subLocalUnit: Joi.string().required(),
    address: Joi.string().required(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponseData>) {
    if(req.method === 'POST'){
        try {
            const { error } = schema.validate(req.body, { abortEarly: false })
        
            if(error){
                return res.status(200).json({
                    success: false,
                    message: 'Validation failed',
                    data: error.details.map((err) => {
                        return {
                            path: err.path[0],
                            message: err.message
                        }
                    })
                });
            }

            const existUser = await UserModel.findOne({
                where: {
                    [Op.or]: [
                        { phone: req.body.phone },
                    ]
                }
            })
            
            if(existUser) return res.status(200).json({
                success: false,
                message: 'Số điện thoại đã tồn tại',
                data: null
            })

            const hashedPassword = await bcrypt.hash(req.body.password, 10)

            const user = await UserModel.create({
                ...req.body,
                password: hashedPassword,
            })

            const userData = user.dataValues as Partial<typeof user.dataValues>;

            delete userData.password;
            delete userData.createdAt;
            delete userData.updatedAt;

            return res.status(200).json({
                success: true,
                message: 'Đăng ký thành công',
                data: userData
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                data: null
            })
        }
    }
}