import { getSession, useSession } from "next-auth/react";
import Link from "next/link";
import Button from "@/components/button";
import { useRouter } from "next/router";
import { withAuth } from "@/hoc/withAuth";
import { GetServerSidePropsContext } from "next";
import { IQuizAttempt, QuizAnswerModel, QuizAttemptModel } from "@models";
import moment from "moment";
import Container from "@/components/container";

export const getServerSideProps = withAuth(async (context: GetServerSidePropsContext) => {
    const { id } = context.query
    if(!id) return { notFound: true }

    const user_id = (await getSession(context))?.user?.id

    const attempt = (await QuizAttemptModel.findOne({
        where: {
            id: Number(id),
            user_id
        }
    }))?.dataValues

    if(!attempt) return { notFound: true }

    const totalQuestion = (await QuizAnswerModel.count({
        where: {
            quiz_attempt_id: attempt?.id
        }
    })) || 0

    return {
        props: {
            submitData: JSON.parse(JSON.stringify(attempt)),
            totalQuestion
        }
    }
}, [])

function PageKetQua({submitData, totalQuestion}: {submitData: IQuizAttempt, totalQuestion: number}) {
    const { data: session } = useSession()
    const router = useRouter()

    const score = ((100 / Number(totalQuestion)) * Number(submitData.score)).toFixed(0)
    const spendTime = moment(submitData.total_time, 'ss').format('mm:ss')

    return session && session.user && (
        <section className="bg-[url('/assets/bg.jpg')] bg-cover pb-36 md:pb-56 3xl:pb-80 pt-12">
            <Container className=''>
                <div className='px-4 py-3 space-x-1 bg-[#EBEDEF] leading-none'>
                    <span className='w-3 h-3 bg-[#E94233] rounded-full inline-block'></span>
                    <span className='w-3 h-3 bg-[#FFDC34] rounded-full inline-block'></span>
                    <span className='w-3 h-3 bg-[#47B26B] rounded-full inline-block'></span>
                </div>
                <div className="bg-white p-3 lg:p-8 space-y-8">
                    <h2 className="text-center mx-auto uppercase">
                        <span className="block text-xl font-extrabold">Cuộc thi:</span> 
                        <span className="block font-medium text-red-500">TÌM HIỂU QUẬN NAM TỪ LIÊM 10 NĂM XÂY DỰNG & PHÁT TRIỂN</span>
                    </h2>
                    <h1 className="text-center text-2xl uppercase">
                        <span className="block">Chúc mừng</span>
                        <span className="block font-bold">{session.user.name}</span>
                        <span className="block">Đã hoàn thành</span>
                    </h1>
                    <div className="space-y-5 text-center lg:flex lg:items-center lg:space-y-0 lg:-mx-2">
                        <div className="space-y-2 font-bold lg:w-1/3 lg:px-2">
                            <p className="uppercase text-lg">Trả lời đúng</p>
                            <p className="w-full rounded bg-red-800 text-white py-2">{submitData.score}/{totalQuestion}</p>
                        </div>
                        <div className="space-y-2 font-bold lg:w-1/3 lg:px-2">
                            <p className="uppercase text-lg">Điểm số</p>
                            <p className="w-full rounded bg-red-800 text-white py-2">{score} / 100</p>
                        </div>
                        <div className="space-y-2 font-bold lg:w-1/3 lg:px-2">
                            <p className="uppercase text-lg">Thời gian</p>
                            <p className="w-full rounded bg-red-800 text-white py-2">{spendTime}</p>
                        </div>
                    </div>
                    {
                        submitData.file_path !== "" && (
                            <Link href={`${submitData.file_path}?download=1`} className="block w-fit" target="_blank">
                                <span className="block text-primary-400 cursor-pointer">Tải xuống tài liệu</span>
                            </Link>
                        )
                    }
                    <Button onClick={()=>router.push('/')} className="w-full">Quay về trang chủ</Button>
                </div>
            </Container>
        </section>
    );
}

export default PageKetQua;