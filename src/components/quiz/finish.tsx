import { Dispatch, SetStateAction } from "react";
import { useSession } from "next-auth/react";
import ISubmitData from "@/interfaces/submitData";
import Link from "next/link";
import Image from "next/image";
import Button from "../button";
import { useRouter } from "next/router";

function QuizFinish({submitData}: { submitData: ISubmitData}) {
    const { data: session } = useSession()
    const router = useRouter()

    const score = ((100 / Number(submitData.totalQuestion)) * Number(submitData.score)).toFixed(0)
    const spendTime = new Date(new Date(submitData.endTime).getTime() - new Date(submitData.startTime).getTime()).toISOString().substring(14,19)

    return session && (
        <div className='max-w-3xl mx-auto'>
            <div className='px-4 py-3 space-x-1 bg-[#EBEDEF] leading-none'>
                <span className='w-3 h-3 bg-[#E94233] rounded-full inline-block'></span>
                <span className='w-3 h-3 bg-[#FFDC34] rounded-full inline-block'></span>
                <span className='w-3 h-3 bg-[#47B26B] rounded-full inline-block'></span>
            </div>
            <div className="bg-white p-3 lg:p-8 space-y-8">
                <h2 className="text-center mx-auto uppercase">
                    <span className="block text-xl font-extrabold">Cuộc thi:</span> 
                    <span className="block font-medium text-red-500">TÌM HIỂU CUỐN SÁCH &quot;LỊCH SỬ CÁCH MẠNG CỦA ĐẢNG BỘ <br /> VÀ NHÂN DÂN QUẬN HAI BÀ TRƯNG (1925 - 2020)&quot;</span>
                </h2>
                <h1 className="text-center text-2xl uppercase">
                    <span className="block">Chúc mừng</span>
                    <span className="block font-bold">{session.user.name}</span>
                    <span className="block">Đã hoàn thành</span>
                </h1>
                <div className="space-y-5 text-center lg:flex lg:items-center lg:space-y-0 lg:-mx-2">
                    <div className="space-y-2 font-bold lg:w-1/3 lg:px-2">
                        <p className="uppercase text-lg">Trả lời đúng</p>
                        <p className="w-full rounded bg-blue-900 text-white py-2">{submitData.score}/{submitData.totalQuestion}</p>
                    </div>
                    <div className="space-y-2 font-bold lg:w-1/3 lg:px-2">
                        <p className="uppercase text-lg">Điểm số</p>
                        <p className="w-full rounded bg-blue-900 text-white py-2">{score} / 100</p>
                    </div>
                    <div className="space-y-2 font-bold lg:w-1/3 lg:px-2">
                        <p className="uppercase text-lg">Thời gian</p>
                        <p className="w-full rounded bg-blue-900 text-white py-2">{spendTime}</p>
                    </div>
                </div>
                {
                    submitData.file !== "" && (
                        <Link href={`${submitData.file}?download=1`} className="block w-fit" target="_blank">
                            <span className="block text-blue-500 cursor-pointer">Tải xuống tài liệu</span>
                        </Link>
                    )
                }
                <Button onClick={()=>router.reload()} className="w-full">Quay về trang chủ</Button>
            </div>
        </div>
    );
}

export default QuizFinish;