import Container from "@/components/container";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import { useEffect } from "react";
import InputPassword from "@/components/inputPassword";

type FormValues = {
    phone: string;
    password: string;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);
    
    if(session?.user) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }        
    }

    return {
        props: {},
    }
}

function PageLogin() {
    const { register, handleSubmit, formState: { errors }, setError, control } = useForm<FormValues>();
    const { callbackUrl } = useRouter().query;
    const { error } = useRouter().query;

    useEffect(() => {
        if(error) {
            setError('phone', { type: 'manual', message: 'Sai số điện thoại hoặc mật khẩu' })
        }
    }, [error,setError])

    const onSubmit = async(data: FormValues) => {
        const res = await signIn('credentials', { phone: data.phone, password: data.password, redirect: true, callbackUrl: callbackUrl as string });
        if(res?.status == 401) {
            setError('phone', { type: 'manual', message: 'Sai số điện thoại hoặc mật khẩu' })
        }
    };

    return (
        <section className="bg-[url('/assets/bg.jpg')] bg-cover pb-36 md:pb-56 3xl:pb-80 pt-12">
            <Container>
                <div className='w-full lg:w-1/2 lg:px-6 leading-none mx-auto'>
                    <div className='px-4 py-3 space-x-1 bg-[#EBEDEF]'>
                        <span className='w-3 h-3 bg-[#E94233] rounded-full inline-block'></span>
                        <span className='w-3 h-3 bg-[#FFDC34] rounded-full inline-block'></span>
                        <span className='w-3 h-3 bg-[#47B26B] rounded-full inline-block'></span>
                    </div>
                    <form className="p-5 lg:p-8 bg-white space-y-8" onSubmit={handleSubmit(onSubmit)}>
                        <h1 className="text-center text-2xl font-semibold">Đăng nhập</h1>
                        <div className='space-y-4'>
                            <div>
                                <p className='font-medium mb-2'>Số điện thoại</p>
                                <input {...register('phone', {required: {value: true, message: 'Trường này là bắt buộc'}, pattern: {value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g, message: 'Sai định dạng số điện thoại'}})} type="text" placeholder='Nhập họ tên của bạn' className='bg-[#EBEDEF] border border-solid border-[#C8CFD6] w-full py-[14px] px-4 rounded placeholder:text-[#04142999]'/>
                                {errors.phone && <p className='text-[#E94233] text-sm'>{errors.phone.message}</p>}
                            </div>
                            <div>
                                <p className='font-medium mb-2'>Mật khẩu</p>
                                <InputPassword control={control} name="password" rules={{required: {value: true, message: 'Trường này là bắt buộc'}, minLength: {value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự'}}} placeholder='Nhập mật khẩu của bạn' className='bg-[#EBEDEF] border border-solid border-[#C8CFD6] w-full py-[14px] px-4 rounded placeholder:text-[#04142999]'/>
                                {errors.password && <p className='text-[#E94233] text-sm'>{errors.password.message}</p>}
                            </div>
                            <p className="text-sm">Chưa có tài khoản ? <Link className="text-primary-400" href="/dang-ky">Đăng ký ngay</Link></p>
                        </div>
                        <button type='submit' className='py-[14px] px-6 font-semibold bg-primary-400 hover:bg-red-600 duration-150 text-white rounded mx-auto block'>Đăng nhập</button>
                    </form>
                </div>
            </Container>
        </section>
    );
}

export default PageLogin;