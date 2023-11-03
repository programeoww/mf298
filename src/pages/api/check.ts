import { NextApiRequest, NextApiResponse } from "next";
import { Op } from "sequelize";
import { getSession } from "next-auth/react";
import moment from "moment";
import contestWeekData from "@/data/contestWeekData";
import { QuizAttemptModel } from "@models";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === "POST"){
        const session = await getSession({ req })

        if(!session?.user){
            return res.status(200).json({
                success: false,
                data: null,
                message: "Bạn cần đăng nhập để tham gia"
            })
        }

        const currentWeek = contestWeekData.findIndex((item) => {
            const startTime = new Date(item.startTime)
            const endTime = new Date(item.endTime)
            const currentTime = moment().utcOffset(7)
            
            return currentTime.isBetween(startTime, endTime)
        })

        let resData = {
            data: true,
            message: ""
        }

        if (session?.user && currentWeek !== -1) {
            const start_time = moment(contestWeekData[currentWeek].startTime).utc(false)
            const end_time = moment(contestWeekData[currentWeek].endTime).utc(false)

            const attemptCount = await QuizAttemptModel.count({
                where: {
                    user_id: session.user.id,
                    createdAt: {
                        [Op.between]: [start_time,end_time]
                    }
                }
            })

            if (attemptCount >= 2){
                resData = {
                    data: false,
                    message: "Tuần này bạn đã làm bài"
                }
            }
        }else{
            resData = {
                data: false,
                message: "Cuộc thi chưa bắt đầu"
            }
        }

        return res.json({
            success: true,
            ...resData
        })
    }
}