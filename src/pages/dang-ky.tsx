import Container from "@/components/container";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import InputPassword from "@/components/inputPassword";
import dynamic from "next/dynamic";
import moment from "moment";
import LocalUnit from "@/data/localUnit";
import instance from "@/instance";
import { toast } from "react-toastify";

const Select = dynamic(() => import('react-select'), { ssr: false });

type FormValues = {
    name: string;
    birthday: number;
    password: string;
    phone: string;
    participateAs: string;
    localUnit: string;
    subLocalUnit: string;
    address: string;
    role: 'admin' | 'user';
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);
    
    if(session) {
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
    const { register, handleSubmit, formState: { errors }, setError, control, watch, setValue } = useForm<FormValues>();
    const { callbackUrl } = useRouter().query;
    const { error } = useRouter().query;

    useEffect(() => {
        if(error) {
            setError('phone', { type: 'manual', message: 'Sai số điện thoại hoặc mật khẩu' })
        }
    }, [error,setError])

    const onSubmit = async(data: FormValues) => {
        data.localUnit = data.localUnit + (data.subLocalUnit ? ` - ${data.subLocalUnit}` : '');
        const { data: { success, message } } = await instance.post('/auth/register', data)
        if(success) {
            const res = await signIn('credentials', { phone: data.phone, password: data.password, redirect: true, callbackUrl: callbackUrl as string });
            if(res?.status == 401) {
                setError('phone', { type: 'manual', message: 'Sai số điện thoại hoặc mật khẩu' })
            }
        }else{
            toast.error(message);
        }
    };

    const getPlaceholder = (participateAs: string) => {
        switch (participateAs) {
            case 'Đảng viên':
                return 'Chọn tổ chức cơ sở Đảng';
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
                return 'Chọn tổ chức cơ sở Đảng';
        }
    }

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
                                <p className='font-medium mb-2'>Họ và tên</p>
                                <input type="text" className='border border-gray-300 rounded w-full py-2 px-3' {...register('name', { required: 'Trường này là bắt buộc' })} />
                                {errors.name && <p className='text-red-500 text-sm mt-1'>{errors.name.message}</p>}
                            </div>
                            <div>
                                <p className='font-medium mb-2'>Số điện thoại</p>
                                <input type="text" className='border border-gray-300 rounded w-full py-2 px-3' {...register('phone', { required: 'Trường này là bắt buộc' })} />
                                {errors.phone && <p className='text-red-500 text-sm mt-1'>{errors.phone.message}</p>}
                            </div>
                            <div>
                                <p className='font-medium mb-2'>Mật khẩu</p>
                                <InputPassword control={control} className='border border-gray-300 rounded w-full py-2 px-3' name="password" rules={{required: 'Trường này là bắt buộc'}} />
                                {errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password.message}</p>}
                            </div>
                            <div className="relative">
                                <p className='font-medium mb-2'>Năm sinh</p>
                                <Controller 
                                    control={control}
                                    name="birthday"
                                    defaultValue={watch('birthday') || moment().year() - 18}
                                    rules={{ required: 'Trường này là bắt buộc' }}
                                    render={() => (
                                        <Select 
                                            options={
                                                Array.from(new Array(moment().year() - 1900 + 1), (_, index) => index + 1900).map((item) => ({ value: item, label: item })).reverse()
                                            }
                                            classNames={{
                                                option: ({isFocused})=>`!cursor-pointer ${isFocused ? '!text-white' : ''}`,
                                            }} 
                                            placeholder='Chọn năm sinh'
                                            theme={(theme) => ({
                                                ...theme,
                                                colors: {
                                                  ...theme.colors,
                                                  primary25: '#C50300',
                                                  primary50: '#C50300',
                                                  primary: '#C50300',
                                                },
                                            })}
                                        />
                                    )}
                                />
                            </div>
                            <div>
                                <p className='font-medium mb-2'>Bạn tham gia với vai trò</p>
                                <Controller 
                                    control={control}
                                    name="participateAs"
                                    rules={{ required: 'Trường này là bắt buộc' }}
                                    defaultValue={watch('participateAs')}
                                    render={({field: {onChange}}) => (
                                        <Select 
                                            options={[
                                                { value: 'Đảng viên', label: 'Đảng viên' },
                                                { value: 'Nhân viên', label: 'Nhân viên' },
                                                { value: 'Đoàn viên/Hội viên', label: 'Đoàn viên/Hội viên' },
                                                { value: 'Giáo viên', label: 'Giáo viên' },
                                                { value: 'Học sinh', label: 'Học sinh' },
                                                { value: 'Thành phần khác', label: 'Thành phần khác' },
                                            ]}
                                            classNames={{
                                                option: ({isFocused})=>`!cursor-pointer ${isFocused ? '!text-white' : ''}`,
                                            }} 
                                            placeholder='Chọn vai trò'
                                            theme={(theme) => ({
                                                ...theme,
                                                colors: {
                                                  ...theme.colors,
                                                  primary25: '#C50300',
                                                  primary50: '#C50300',
                                                  primary: '#C50300',
                                                },
                                            })}
                                            onChange={(e) => {
                                                onChange((e as {value:string}).value);
                                            }}
                                        />
                                    )}
                                />
                            </div>
                            {
                                watch('participateAs') == 'Đảng viên' && (
                                    <div>
                                        <Controller 
                                            control={control}
                                            name="localUnit"
                                            defaultValue={watch('localUnit')}
                                            rules={{ required: 'Trường này là bắt buộc' }}
                                            render={({field: {onChange}}) => (
                                                <Select 
                                                    options={LocalUnit.map((item) => ({ value: item.name, label: item.name }))}
                                                    classNames={{
                                                        option: ({isFocused})=>`!cursor-pointer ${isFocused ? '!text-white' : ''}`,
                                                    }} 
                                                    placeholder='Chọn tổ chức cơ sở Đảng'
                                                    theme={(theme) => ({
                                                        ...theme,
                                                        colors: {
                                                        ...theme.colors,
                                                        primary25: '#C50300',
                                                        primary50: '#C50300',
                                                        primary: '#C50300',
                                                        },
                                                    })}
                                                    onChange={(e: unknown) => {
                                                        onChange((e as {value:string}).value);
                                                        setValue('subLocalUnit', '');
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>
                                )
                            }
                            {
                                watch('participateAs') && watch('participateAs') !== 'Đảng viên' && (
                                    <>
                                        <div className="flex items-center border border-gray-300 rounded w-full overflow-hidden">
                                            <p className="self-stretch flex items-center px-3 text-sm border-r bg-neutral-100">
                                                { getPlaceholder(watch('participateAs')) }
                                            </p>
                                            <input type="text" className='py-2 px-3 outline-none' {...register('localUnit', { required: 'Trường này là bắt buộc' })} placeholder={getPlaceholder(watch('participateAs'))} />
                                        </div>
                                        {errors.localUnit && <p className='text-red-500 text-sm !mt-1'>{errors.localUnit.message}</p>}
                                    </>
                                )
                            }
                            {
                                watch('localUnit') && watch('localUnit').startsWith('Đảng bộ phường') && (
                                    <div>
                                        <Controller 
                                            control={control}
                                            name="subLocalUnit"
                                            defaultValue={watch('subLocalUnit')}
                                            rules={{ required: 'Trường này là bắt buộc' }}
                                            render={({field: {onChange}}) => (
                                                <Select 
                                                    options={LocalUnit.find((item) => item.name == watch('localUnit'))?.subUnit?.map((item) => ({ value: item, label: item })) || []}
                                                    classNames={{
                                                        option: ({isFocused})=>`!cursor-pointer ${isFocused ? '!text-white' : ''}`,
                                                    }} 
                                                    placeholder='Chọn chi bộ'
                                                    theme={(theme) => ({
                                                        ...theme,
                                                        colors: {
                                                        ...theme.colors,
                                                        primary25: '#C50300',
                                                        primary50: '#C50300',
                                                        primary: '#C50300',
                                                        },
                                                    })}
                                                    onChange={(e: unknown) => {
                                                        onChange((e as {value:string}).value);
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>
                                )
                            }
                            <div>
                                <p className='font-medium mb-2'>Địa chỉ</p>
                                <input type="text" className='border border-gray-300 rounded w-full py-2 px-3' {...register('address', { required: 'Trường này là bắt buộc' })} />
                                {errors.address && <p className='text-red-500 text-sm mt-1'>{errors.address.message}</p>}
                            </div>
                            <p className="text-sm">Đã có tài khoản ? <Link className="text-primary-400" href="/dang-nhap">Đăng nhập</Link></p>
                        </div>
                        <button type='submit' className='py-[14px] px-6 font-semibold bg-primary-400 hover:bg-red-600 duration-150 text-white rounded mx-auto block'>Đăng ký</button>
                    </form>
                </div>
            </Container>
        </section>
    );
}

export default PageLogin;