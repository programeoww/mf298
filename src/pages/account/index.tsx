import { getSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import Container from "@/components/container";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut,useSession } from "next-auth/react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { toast } from "react-toastify";
import instance from "@/instance";

export const navList = [
    {
        name: 'Tài khoản',
        path: '/account',
        exact: true
    },
    {
        name: 'Thống kê',
        path: '/account/statistic',
        isAdmin: true,
    },
    {
        name: 'Quản lý người dùng',
        path: '/account/user',
        isAdmin: true,
        exact: true,
        matcher: /(\/account\/user\/).*/g
    },
    {
        name: 'Lịch sử làm bài',
        path: '/account/history',
        isAdmin: false,
    },
]

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if(!session || !session.user){
        return {
            redirect: {
                destination: '/dang-nhap?callbackUrl=/account',
                permanent: true,
            }
        }        
    }

    return {
        props: {},
    }
}

type FormValues = {
    name: string;
    phone: string;
    address: string;
};

function PageAccount() {
    const router = useRouter();
    const { data: session } = useSession();
    const { register, handleSubmit, formState: { errors }, resetField, setValue, watch } = useForm<FormValues>();

    useEffect(() => {
        if(session){
            setValue('name', session.user?.name || "");
            setValue('phone', session.user?.phone || "");
            setValue('address', session.user?.address || "");
        }
    }, [session, setValue])

    const onSubmit = async (data: FormValues) => {
        const { data: { success } } = await instance.patch(`/account/${session?.user?.id}`, data,{
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`
            }
        });

        if(success){
            toast.success('Cập nhật thành công');
        }
    }

    return session && (
        <section className="bg-[url('/assets/bg.jpg')] bg-cover pb-36 md:pb-56 3xl:pb-80 pt-12">
            <Container className="">
                <div className="flex flex-wrap space-y-8 lg:space-y-0 lg:divide-x bg-white p-12 rounded">
                    <div className="w-full lg:w-1/4 space-y-5">
                        <div className="flex items-center space-x-5">
                            <div className="w-20 h-20 overflow-hidden bg-gray-300 rounded-full flex items-center justify-center">
                                <Image src="/assets/avatar.jpg" width={80} height={80} alt="avatar" />
                            </div>
                            <p>{session.user?.name} <span className="text-gray-400 italic">#{session.user?.id}</span></p>
                        </div>
                        <ul className="divide-y uppercase">
                        {
                            navList.map((item, index) => {
                                if(item.isAdmin && session.user?.role != 'admin') return null;
                                return (
                                    <li key={index}><Link className={`${router.pathname.match(item.path) ? 'text-gray-700' : 'text-gray-400 hover:text-gray-700'} duration-150 p-2 w-full block`} href={item.path}>{item.name}</Link></li>
                                )
                            })
                        }
                        <li onClick={()=>signOut({callbackUrl: '/'})} className="text-gray-400 hover:text-gray-700 duration-150 p-2 w-full block cursor-pointer">Thoát</li>
                        </ul>
                    </div>
                    <div className="w-full lg:w-3/4 lg:pl-8 space-y-5">
                        <h1 className="text-2xl font-bold">Tài khoản</h1>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <p className='font-medium mb-2'>Họ tên</p>
                                <input {...register('name', {required: {value: true, message: 'Trường này là bắt buộc'}})} type="text" placeholder='Nhập họ tên của bạn' className='bg-[#EBEDEF] border border-solid border-[#C8CFD6] w-full py-[14px] px-4 rounded placeholder:text-[#04142999]'/>
                                {errors.name && <p className='text-[#E94233] text-sm'>{errors.name.message}</p>}
                            </div>
                            <div>
                                <p className='font-medium mb-2'>Số điện thoại</p>
                                <input {...register('phone', {required: {value: true, message: 'Trường này là bắt buộc'}, pattern: {value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g, message: 'Sai định dạng số điện thoại'}})} type="text" placeholder='Nhập số điện thoại của bạn' className='bg-[#EBEDEF] border border-solid border-[#C8CFD6] w-full py-[14px] px-4 rounded placeholder:text-[#04142999]'/>
                                {errors.phone && <p className='text-[#E94233] text-sm'>{errors.phone.message}</p>}
                            </div>
                            <div>
                                <p className='font-medium mb-2'>Địa chỉ</p>
                                <input {...register('address', {required: {value: true, message: 'Trường này là bắt buộc'}})} type="text" placeholder='Nhập địa chỉ của bạn' className='bg-[#EBEDEF] border border-solid border-[#C8CFD6] w-full py-[14px] px-4 rounded placeholder:text-[#04142999]'/>
                                {errors.address && <p className='text-[#E94233] text-sm'>{errors.address.message}</p>}
                            </div>
                            <div>
                                <button type='submit' className='bg-primary-400 text-white w-full py-[14px] rounded font-medium'>Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            </Container>
        </section>
        );
}

export default PageAccount;