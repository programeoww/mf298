import { NextApiRequest, NextApiResponse } from "next";
import { ApiResponseData } from "@/interfaces";
import formidable, { IncomingForm } from "formidable";
import { QuizAnswerModel, QuizAttemptModel, UserModel } from "@models";
import contestWeekData from "@/data/contestWeekData";
import moment from "moment";
import fs from "fs";
import axios from "axios";
import csvtojson from "csvtojson";

type FieldValues = {
    startTime: [string],
    endTime: [string],
    userId: [string],
    data: string
}

const createQuizAttempt = async (userId: number, startTime: string, endTime: string, certificate_path: string, fileName: string, score: number, ansData: string, unAnswered: number, wrongAnswered: number) => {
    const attempt = await QuizAttemptModel.create({
        user_id: userId,
        file_path: fileName,
        score,
        start_time: startTime,
        end_time: endTime,
        total_time: moment(endTime).diff(moment(startTime), 'seconds'),
        certificate_path: certificate_path,
        unAnswered,
        wrongAnswered
    })

    try {
        for (const item of JSON.parse(ansData)) {
            await QuizAnswerModel.create({
                quiz_attempt_id: attempt.getDataValue('id'),
                question: item.question,
                answer: item.answer,
                timestamp: item.timestamp
            })
        }
    } catch (error) {
        console.log(error);
    }
    return attempt
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponseData>) {
    switch (req.method) {
        case "POST":
            const form = new IncomingForm()

            form.parse(req, async (err, fields, files) => {
                if (err) return res.json({
                    success: false,
                    message: "Something went wrong",
                    data: null
                })
                
                const user = await UserModel.findOne({
                    where: {
                        id: (fields as unknown as FieldValues).userId[0]
                    }
                })

                if (!user) {
                    return res.json({
                        success: false,
                        message: "User not found",
                        data: null
                    })
                }

                const currentWeekIndex = contestWeekData.findIndex((item) => {
                    const startTime = moment(item.startTime).utc(false)
                    const endTime = moment(item.endTime).utc(false)
                    const currentTime = moment().utc(false)
                    return currentTime.isBetween(startTime, endTime)
                })

                if (currentWeekIndex === -1 && process.env.NODE_ENV !== "development" && user?.getDataValue('role') !== "admin") {
                    res.json({
                        success: false,
                        message: "Contest is not started yet",
                        data: null
                    })
                    return
                }

                let fileName = ""

                if (files.file && (files.file as formidable.File[]).length > 0) {
                    if ((files.file as formidable.File[])[0].size > 1024 * 1024 * 10) return res.json({
                        success: false,
                        message: "File size must be less than 10MB",
                        data: null
                    })

                    fileName = `uploads/${new Date().getTime()}-${(files.file as formidable.File[])[0].originalFilename!.replace(/ /g, "_")}`
                    fs.copyFileSync((files.file as formidable.File[])[0].filepath, `./public/${fileName}`)
                    fs.unlinkSync((files.file as formidable.File[])[0].filepath)
                    fileName = process.env.NEXT_PUBLIC_API_URL! + fileName
                }

                let unAnswered = 0
                let wrongAnswered = 0
                const { data } = await axios.get<string>(`https://docs.google.com/spreadsheets/d/e/2PACX-1vRBBUlRVFMO908C0EMBHeyxOMw-2euDDb55AqZVVB5NOpNpPROpTKfa_Vn_730bS8MvJ1N0w-wW9bdj/pub?output=csv&gid=${contestWeekData[currentWeekIndex].questionsTabID}&single=true`)
                const listCauHoi = await csvtojson().fromString(data)

                const score = JSON.parse((fields as unknown as FieldValues).data).reduce((acc: number, cur: { question: string, answer: string }) => {
                    const cauHoiItem = listCauHoi.find((item: { [x: string]: string; }) => {
                        return item["Câu hỏi"] === cur.question
                    })

                    if (cauHoiItem && cauHoiItem["Đáp án 1 ( Đáp án đúng)"] === cur.answer) return acc + 1
                    else if (cur.answer === "") unAnswered++
                    else wrongAnswered++
                    return acc
                }, 0)

                const createdAttempt = await createQuizAttempt(Number((fields as unknown as FieldValues).userId), (fields as unknown as FieldValues).startTime[0], (fields as unknown as FieldValues).endTime[0], process.env.NEXT_PUBLIC_API_URL! + `certificates.jpg`, fileName, score, (fields as unknown as FieldValues).data, unAnswered, wrongAnswered)

                return res.json({
                    success: true,
                    message: "Quiz submitted",
                    data: {
                        score,
                        totalQuestion: JSON.parse((fields as unknown as FieldValues).data).length,
                        unAnswered,
                        wrongAnswered,
                        attemptId: createdAttempt.dataValues.id,
                        startTime: moment(createdAttempt.dataValues.start_time).format(),
                        endTime: moment(createdAttempt.dataValues.end_time).format(),
                        file: createdAttempt.dataValues.file_path,
                        total_time: createdAttempt.dataValues.total_time,
                    }
                })
            })
            break;
        default:
            return res.status(405).json({
                success: false,
                data: null,
                message: "Method not allowed"
            })
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};