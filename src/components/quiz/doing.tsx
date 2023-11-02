import IQuestion from "@/interfaces/question";
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useSession } from "next-auth/react";
import instance from "@/services/instance";
import ISubmitData from "@/interfaces/submitData";
import Button from "../button";
import { toast } from "react-toastify";
import moment from "moment";
interface IFormInput {
    answer: string,
    file: FileList
}

function QuizDoing({ setQuizProgress, setSubmitData, startTime }: { startTime: string, setSubmitData: Dispatch<SetStateAction<ISubmitData | null>> , setQuizProgress: Dispatch<SetStateAction<'waiting' | 'doing' | 'finished'>> }) {
    const { register, resetField, control, getValues } = useForm<IFormInput>()
    const [timer, setTimer] = useState<number>(30)
    const [answer, setAnswer] = useState<{ answer: string | FileList, timestamp: string }[]>([])
    const [currentQuestion, setCurrentQuestion] = useState<number>(0)
    const [uploadFile, setUploadFile] = useState<boolean>(false)
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [questions, setQuestions] = useState<IQuestion[]>([])

    const watchAnswer = useWatch({
        name: 'answer',
        defaultValue: '',
        control
    })

    useEffect(() => {
        const fetchData = async () => {
            const { data } = await instance.get('/quiz/get-questions')
            if(!data.success){
                toast.error(data.message)
                return
            }
            const questions = data.data as IQuestion[]
            setQuestions(questions)
        }
        fetchData()
    }, [])

    const submitAnswer = useCallback(async () => {
        setIsLoading(true)
        if(!session || !session.user) {
            setIsLoading(false)
            return
        }

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

        const { data } = await instance.post('/quiz/submit', formData, {
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

        setSubmitData(data.data)
        setQuizProgress('finished')
        // setIsLoading(false)
    }, [answer, questions, startTime, session, getValues, setQuizProgress, setSubmitData])

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
                    <Button isLoading={isLoading} className="bg-[#457AE6] hover:bg-[#416cc4] duration-150 text-white font-semibold px-8 py-3 rounded-lg w-full" onClick={handleNextQuestion}>{!uploadFile ? 'Tiếp theo' : 'Hoàn thành'}</Button>
                    { uploadFile && <p className="text-[#457AE6] cursor-pointer w-fit" onClick={()=>{resetField('file'); handleNextQuestion()}}>Bỏ qua</p> }
                </div>
            </div>
            <div className="w-full py-3 lg:py-0 order-1 lg:order-none lg:w-2/6 lg:px-3 leading-none">
                <div className='px-4 py-3 space-x-1 bg-[#EBEDEF]'>
                    <span className='w-3 h-3 bg-[#E94233] rounded-full inline-block'></span>
                    <span className='w-3 h-3 bg-[#FFDC34] rounded-full inline-block'></span>
                    <span className='w-3 h-3 bg-[#47B26B] rounded-full inline-block'></span>
                </div>
                <div className="bg-white p-5 space-y-6">
                    <p className="font-bold text-6xl text-center text-[#457AE6]">0:{String(timer).padStart(2, '0')}</p>
                    <p className="font-semibold text-center">Câu hỏi {answer.filter((item) => item !== null && (item as unknown as string) !== "").length}/{questions.length}</p>
                    {
                        session && session.user && (
                            <div className="leading-normal">
                                <p><span className="font-bold">Họ tên:</span> {session.user.name}</p>
                                <p><span className="font-bold">Số điện thoại:</span> {session.user.phone}</p>
                                <p><span className="font-bold">Đơn vị:</span> {session.user.localUnit}</p>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    ): (
        <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-neutral-300"></div>
        </div>
    )
}

export default QuizDoing;