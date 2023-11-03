import { getSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import Container from "@/components/container";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut,useSession } from "next-auth/react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { navList } from "..";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import Table from "@/components/table";
import { IUser, QuizAttemptModel, UserModel } from "@models";
import instance from "@/instance";

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

    const user = await UserModel.findOne({
        where: {
            id: context.params!.id
        }
    })

    if(!user){
        return {
            notFound: true
        }
    }

    const attempts = await QuizAttemptModel.findAll({
        attributes: ['id', 'score', 'total_time', 'createdAt', 'file_path'],
        where: {
            user_id: user.getDataValue('id')
        },
        order: [
            ['createdAt', 'DESC']
        ]
    })

    return {
        props: {
            user: JSON.stringify(user.dataValues),
            attempts: JSON.stringify(attempts),
        },
    }
}

type FormValues = {
    name: string;
    phone: string;
    address: string;
    localUnit: string;
    workingUnit: string;
    password: string;
    repassword: string;
    role: 'admin' | 'user';
};

type IAttemptTable = {
    id: number;
    score: number;
    total_time: number | string;
    createdAt: string;
    file_path: string;
}

function PageUserEdit({ user, attempts } : { user: string, attempts: string }) {
    const [userModel, setUserModel] = useState<IUser>(JSON.parse(user));
    const router = useRouter();
    const { register, handleSubmit, formState: { errors }, resetField, setValue, watch } = useForm<FormValues>();
    const { data: session } = useSession();

    useEffect(() => {
        if(userModel){
            setValue('name', userModel.name);
            setValue('phone', userModel.phone);
            setValue('address', userModel.address);
            setValue('role', userModel.role);
        }
    }, [userModel, setValue])

    const onSubmit = async (data: FormValues) => {
        const { data : response } = await instance.patch(`/account/${userModel.id}`, data,{
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`
            }
        });

        if(response.success){
            setUserModel(response.data)
            toast.success('Cập nhật thành công');
            resetField('password');
            resetField('repassword');
        }
    }

    const attemptsData = useMemo(() => JSON.parse(attempts) as IAttemptTable[], [attempts]);

    const columnHelper = useMemo(() => createColumnHelper<IAttemptTable>(), []);

    const columns = useMemo(
        () => [
          {
            id: "index",
            header: "STT",
            cell: ({ row }) => row.index + 1,
          },
          columnHelper.accessor("score", {
            header: "Điểm",
            cell: ({cell}) => `${Number(cell.getValue() as number) * 5} / 100`,
          }),
          columnHelper.accessor("total_time", {
            header: "Thời gian",
            cell: ({cell}) => `${new Date((cell.getValue() as number) * 1000).toISOString().substring(14, 19)}`,
          }),
          columnHelper.accessor("createdAt", {
            header: "Thời gian nộp bài",
            cell: ({cell}) => `${new Date(cell.getValue() as string).toLocaleString()}`,
          }),
          {
            id: "action",
            header: "Hành động",
            cell: ({ row }) => (                
                row.original.file_path && <Link target="_blank" className="text-[#196EDE]" href={row.original.file_path.replace('./', process.env.NEXT_PUBLIC_APP_URL!) + '?download=1'}>Tải xuống tài liệu</Link>
            ),
          }
        ] as Array<ColumnDef<IAttemptTable, unknown>>, [columnHelper]
      );

    return session && (
        <section className="bg-[url('/assets/bg.jpg')] bg-cover pb-36 md:pb-56 3xl:pb-80 pt-12">
            <Container className="">
                <div className="flex flex-wrap space-y-8 lg:space-y-0 lg:divide-x  bg-white p-12 rounded">
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
                                    <li key={index}><Link className={`${router.pathname.match(item.matcher || "\0") ? 'text-gray-700' : 'text-gray-400 hover:text-gray-700'} duration-150 p-2 w-full block`} href={item.path}>{item.name}</Link></li>
                                )
                            })
                        }
                        <li onClick={()=>signOut({callbackUrl: '/'})} className="text-gray-400 hover:text-gray-700 duration-150 p-2 w-full block cursor-pointer">Thoát</li>
                        </ul>
                    </div>
                    <div className="w-full lg:w-3/4 lg:pl-8 space-y-5">
                        <h1 className="text-2xl font-bold">Lịch sử làm bài</h1>
                        <div className="space-y-5">
                            <Table data={attemptsData} columns={columns} />
                        </div>
                        <h1 className="text-2xl font-bold">Sửa tài khoản: {userModel.name}</h1>
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
                            {
                                session.user?.id != userModel.id && (
                                    <div>
                                        <p className='font-medium mb-2'>Vai trò</p>
                                        <select {...register('role')} className='bg-[#EBEDEF] border border-solid border-[#C8CFD6] w-full py-[14px] px-4 rounded placeholder:text-[#04142999]'>
                                            <option value="user">Người dùng</option>
                                            <option value="admin">Quản trị viên</option>
                                        </select>
                                    </div>
                                )
                            }
                            <div>
                                <button type='submit' className='bg-[#196EDE] text-white w-full py-[14px] rounded font-medium'>Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            </Container>
        </section>
        );
}

export default PageUserEdit;