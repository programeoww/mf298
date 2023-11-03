import Container from '@/components/container';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { navList } from '..';
import Table from '@/components/table';
import instance from '@/instance';
import ExcelDownloader from '@/utils/excelDownloader';
import { IUser } from '@models';

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if(!session || !session.user || session.user.role !== 'admin'){
        return {
            redirect: {
                destination: '/dang-nhap?callbackUrl=/account',
                permanent: true,
            }
        }        
    }

    return {
        props: {
        },
    }
}

type IUserTable = {
    id: number;
    name: string;
    phone: string;
    localUnit: string;
    role: string;
    createdAt: string;
    lastAttempt: string;
    quiz_attempts: {
        id: string;
        file_path: string;
    }[];
}

function PageUserManager() {
    const [userData, setUserData] = useState<IUser[]>([]);
    const router = useRouter();
    const { data: session } = useSession();
    const firedRef = useRef(false);

    const handleRemove = useMemo(() => async (id: string | number) => {
            try {
                const { data : { success }} = await instance.delete(`/account/${id}`);
    
                if(!success) throw new Error();
    
                toast.success('Xóa người dùng thành công');
                
                setUserData(userData.filter(user => user.id !== id));
            } catch (error) {
                toast.error('Xóa người dùng thất bại');
            }
        }
    , [userData]);

    const columnHelper = useMemo(() => createColumnHelper<IUserTable>(), []);

    const columns = useMemo(
        () => [
          {
            id: "index",
            header: "STT",
            cell: ({ row }) => row.index + 1,
          },
          columnHelper.accessor("name", {
            header: "Họ tên",
            cell: ({ row }) => <Link className='text-blue-500' href={`/account/user/${row.original.id}`}>{row.original.name}</Link>,
          }),
          columnHelper.accessor("phone", {
            header: "Số điện thoại",
          }),
          columnHelper.accessor("localUnit", {
            header: "Đơn vị",
          }),
          columnHelper.accessor("role", {
            header: "Vai trò",
          }),
          columnHelper.accessor("lastAttempt", {
            header: "Lần thi cuối",
            cell: ({ row }) => row.original.lastAttempt ? new Date(row.original.lastAttempt).toLocaleString() : 'Chưa thi',
          }),
          {
            id: "docs",
            header: "Tài liệu",
            cell: ({ row }) => <div className="flex items-center space-x-1">
                {
                    row.original.quiz_attempts && row.original.quiz_attempts.length > 0 && (
                        <button className="p-1 border rounded text-gray-700 hover:border-transparent hover:text-white hover:bg-[#20744a] cursor-pointer duration-150"
                            onClick={()=>ExcelDownloader(row.original.quiz_attempts, 'export', ['id', 'link'])}
                        >
                            <svg fill='currentColor' xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>
                        </button>
                    )
                }
            </div>
          },
          {
            id: "action",
            header: "Hành động",
            cell: ({ row }) => <div className="flex items-center space-x-1">
                {
                    row.original.id != session?.user?.id && (
                        <>
                            <Link className="p-1 border rounded text-gray-700 hover:border-transparent hover:text-white hover:bg-[#196EDE] cursor-pointer duration-150" href={`/account/user/${row.original.id as number}`}>
                            <svg fill='currentColor' xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16"><path d="M180-12q-24 0-42-18t-18-42v-600q0-24 18-42t42-18h405l-60 60H180v600h600v-348l60-60v408q0 24-18 42t-42 18H180Zm300-360Zm182-352 43 42-285 284v86h85l286-286 42 42-303 304H360v-170l302-302Zm171 168L662-724l100-100q17-17 42.311-17T847-823l84 85q17 18 17 42.472T930-654l-97 98Z"/></svg>
                            </Link>
                            <button className="p-1 border rounded text-gray-700 hover:border-transparent hover:text-white hover:bg-red-500 cursor-pointer duration-150"
                                onClick={() => { handleRemove(row.original.id) }}
                            >
                                <svg fill='currentColor' xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16"><path d="M261-120q-24.75 0-42.375-17.625T201-180v-570h-41v-60h188v-30h264v30h188v60h-41v570q0 24-18 42t-42 18H261Zm438-630H261v570h438v-570ZM367-266h60v-399h-60v399Zm166 0h60v-399h-60v399ZM261-750v570-570Z"/></svg>
                            </button>
                        </>
                    )
                }
            </div>
          }
        ] as Array<ColumnDef<IUserTable, unknown>>, [columnHelper, handleRemove, session]
      );

    useEffect(() => {
        (async () => {
            if(firedRef.current || !session) return;
            const { data: response } = await instance.get('/users', {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`
                }
            });

            firedRef.current = true;
            setUserData(response.data.users);
        })()
    }, [session]);

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
                                    <li key={index}><Link className={`${router.pathname == item.path ? 'text-gray-700' : 'text-gray-400 hover:text-gray-700'} duration-150 p-2 w-full block`} href={item.path}>{item.name}</Link></li>
                                )
                            })
                        }
                        <li onClick={()=>signOut({callbackUrl: '/'})} className="text-gray-400 hover:text-gray-700 duration-150 p-2 w-full block cursor-pointer">Thoát</li>
                        </ul>
                    </div>
                    <div className="w-full lg:w-3/4 lg:pl-8 space-y-5">
                        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
                        <Table globalFilterEnable data={userData} columns={columns} />
                    </div>
                </div>
            </Container>
        </section>
    );
}

export default PageUserManager;