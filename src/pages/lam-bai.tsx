import Button from "@/components/button";
import Container from "@/components/container";
import { withAuth } from "@/hoc/withAuth";
import instance from "@/instance";
import { IQuestion } from "@/interfaces";
import moment from "moment";
import { GetServerSidePropsContext } from "next";
import { getSession, useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import axios from "axios";
import csvtojson from "csvtojson";
import contestWeekData from "@/data/contestWeekData";
import transformQuestion from "@/utils/transformQuestion";
import shuffle from "@/utils/shuffle";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

export const getServerSideProps = withAuth(async (context: GetServerSidePropsContext) => {
    const session = (await getSession(context))!
    
    const currentWeekIndex = contestWeekData.findIndex((item) => {
        const startTime = moment(item.startTime).utc(false)
        const endTime = moment(item.endTime).utc(false)
        const currentTime = moment().utc(false)
        return currentTime.isBetween(startTime, endTime)
    })

    if (session?.user && currentWeekIndex !== -1) {
        const start_time = moment(contestWeekData[currentWeekIndex].startTime).utc(false)
        const end_time = moment(contestWeekData[currentWeekIndex].endTime).utc(false)

        // const lastAttempt = await UserModel.findAll({
        //     where: {
        //         id: session.user.id,
        //     },
        //     order: [
        //         ['createdAt', 'DESC']
        //     ]
        // })

        // if (lastAttempt){
        //     resData = {
        //         data: false,
        //         message: "Tuần này bạn đã làm bài"
        //     }
        // }
    }else{
        return {
            redirect: {
                destination: '/',
                statusCode: 302,
            }
        }
    }

    // if(process.env.NODE_ENV === "development" || session.user.role === "admin") resData.data = true
    
    const { data } = await axios.get<string>(`https://docs.google.com/spreadsheets/d/e/2PACX-1vRBBUlRVFMO908C0EMBHeyxOMw-2euDDb55AqZVVB5NOpNpPROpTKfa_Vn_730bS8MvJ1N0w-wW9bdj/pub?output=csv&gid=${contestWeekData[currentWeekIndex].questionsTabID}&single=true`)
    const question = await csvtojson().fromString(data)
    return {
        props: {
            questions: transformQuestion(shuffle(question).slice(0, 20)),
            startTime: moment().toISOString(true)
        }
    }
}, [], { callbackUrl: '/lam-bai' });

type IFormInput = {
    answer: string,
    file: FileList
}

function PageDoingQuiz({questions, startTime}: {questions: IQuestion[], startTime: string}) {
    const { register, resetField, control, getValues } = useForm<IFormInput>()
    const [timer, setTimer] = useState<number>(30)
    const [answer, setAnswer] = useState<{ answer: string | FileList, timestamp: string }[]>([])
    const [currentQuestion, setCurrentQuestion] = useState<number>(0)
    const [uploadFile, setUploadFile] = useState<boolean>(false)
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const router = useRouter()

    const getPlaceholder = (participateAs: string) => {
        switch (participateAs) {
            case 'Đảng viên':
                return 'Tổ chức cơ sở Đảng';
            case 'Nhân viên':
                return 'Cơ quan, đơn vị';
            case 'Đoàn viên/Hội viên':
                return 'Sinh hoạt tại chi/hội';
            case 'Giáo viên':
                return 'Trường';
            case 'Học sinh':
                return 'Trường';
            case 'Thành phần khác':
                return 'Tại phường';
            default:
                return 'Tổ chức cơ sở Đảng';
        }
    }

    const watchAnswer = useWatch({
        name: 'answer',
        defaultValue: '',
        control
    })

    const submitAnswer = useCallback(async () => {
        if(!session || !session.user) return
        setIsLoading(true)

        const submission = {
            startTime,
            endTime: moment().toISOString(true),
            userId: session.user.id,
            data: questions.map((question, index) => {
                return {
                    question: question.question,
                    answer: answer[index].answer,
                    timestamp: answer[index].timestamp
                }
            }),
            file: getValues('file')
        }

        const formData = new FormData()
        formData.append('startTime', submission.startTime)
        formData.append('endTime', submission.endTime)
        formData.append('userId', submission.userId.toString())
        formData.append('data', JSON.stringify(submission.data))
        if(submission.file && submission.file.length > 0){
            formData.append('file', submission.file[0])
        }
        
        const { data } = await instance.post('/submit', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': 'Bearer ' + session.accessToken
            }
        })

        if(!data.success){
            toast.error(data.message)
            setIsLoading(false)
            return
        }

        router.push(`/ket-qua/${data.data.attemptId}`)
    }, [answer, getValues, questions, session, startTime, router])

    const handleNextQuestion = useCallback(() => {
        setIsLoading(true)
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion((prev) => prev + 1)
            setTimer(30)
            resetField('answer');
            setIsLoading(false)
        } else if(!uploadFile) {
            setTimer(0)
            setUploadFile(true)
            setIsLoading(false)
        } else{
            submitAnswer()
        }
    }, [currentQuestion, questions.length, resetField, setUploadFile, submitAnswer, uploadFile])

    useEffect(() => {
        const interval = setInterval(() => {
            if(timer > 0){
                setTimer((prev) => prev - 1)
            }else if(!uploadFile){
                handleNextQuestion()
            }
        }, 1000)
        return () => clearInterval(interval)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timer])

    useEffect(() => {
        setAnswer((prev) => {
            const newAnswer = [...prev]
            newAnswer[currentQuestion] = {
                answer: watchAnswer,
                timestamp: moment().format()
            }
            return newAnswer
        })
    }, [watchAnswer, currentQuestion])

    return questions && questions.length > 0 ? (
        <section className="bg-[url('/assets/bg.jpg')] bg-cover pb-36 md:pb-56 3xl:pb-80 pt-12">
            <Container>
                <div className="flex flex-wrap lg:-mx-3">
                    <div className='w-full py-3 lg:py-0 order-2 lg:order-none lg:w-4/6 lg:px-3 leading-none'>
                        <div className='px-4 py-3 space-x-1 bg-[#EBEDEF]'>
                            <span className='w-3 h-3 bg-[#E94233] rounded-full inline-block'></span>
                            <span className='w-3 h-3 bg-[#FFDC34] rounded-full inline-block'></span>
                            <span className='w-3 h-3 bg-[#47B26B] rounded-full inline-block'></span>
                        </div>
                        <div className="bg-white p-5 lg:p-8 space-y-8">
                            <h2 className="font-semibold text-lg">{ !uploadFile ? questions[currentQuestion].question : 'Upload tài liệu' }</h2> 
                            <ul className="space-y-5">
                                {
                                    !uploadFile ? (questions[currentQuestion].answers! as Array<string>).map((answer, index) => (
                                        <li key={index} className=''>
                                            <label className="flex items-start cursor-pointer">
                                                <input type="radio" {...register('answer')} value={answer} />
                                                <p className='ml-2'>{answer}</p>
                                            </label>
                                        </li>
                                    )) : (
                                        <li className=''>
                                            <label className="flex items-start cursor-pointer">
                                                <input type="file" {...register('file')} accept="application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint,text/plain, application/pdf, image/*" />
                                            </label>
                                        </li>
                                    )
                                }
                            </ul>
                            <Button isLoading={isLoading} className="bg-primary-400 hover:bg-red-600 duration-150 text-white font-semibold px-8 py-3 rounded-lg w-full" onClick={handleNextQuestion}>{!uploadFile ? 'Tiếp theo' : 'Hoàn thành'}</Button>
                            { uploadFile && <p className="text-primary-400 cursor-pointer w-fit" onClick={()=>{resetField('file'); handleNextQuestion()}}>Bỏ qua</p> }
                        </div>
                    </div>
                    <div className="w-full py-3 lg:py-0 order-1 lg:order-none lg:w-2/6 lg:px-3 leading-none">
                        <div className='px-4 py-3 space-x-1 bg-[#EBEDEF]'>
                            <span className='w-3 h-3 bg-[#E94233] rounded-full inline-block'></span>
                            <span className='w-3 h-3 bg-[#FFDC34] rounded-full inline-block'></span>
                            <span className='w-3 h-3 bg-[#47B26B] rounded-full inline-block'></span>
                        </div>
                        <div className="bg-white p-5 space-y-6">
                            <p className="font-bold text-6xl text-center text-primary-400">0:{String(timer).padStart(2, '0')}</p>
                            <p className="font-semibold text-center">Câu hỏi {answer.filter((item) => item !== null && (item as unknown as string) !== "").length}/{questions.length}</p>
                            {
                                session && session.user && (
                                    <div className="leading-normal">
                                        <p><span className="font-bold">Họ tên:</span> {session.user.name}</p>
                                        <p><span className="font-bold">Số điện thoại:</span> {session.user.phone}</p>
                                        <p><span className="font-bold">Tham gia với tư cách:</span> {session.user.participateAs}</p>
                                        <p><span className="font-bold">{getPlaceholder(session.user.participateAs)}:</span> {session.user.localUnit}</p>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    ): (
        <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-neutral-300"></div>
        </div>
    )
}

export default PageDoingQuiz;