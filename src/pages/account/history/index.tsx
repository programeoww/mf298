import { getSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import Container from "@/components/container";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut,useSession } from "next-auth/react";
import Image from "next/image";
import { navList } from "..";
import { useMemo } from "react";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import Table from "@/components/table";
import { QuizAttemptModel } from "@models";

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

    const attempts = await QuizAttemptModel.findAll({
        attributes: ['id', 'score', 'total_time', 'createdAt'],
        where: {
            user_id: session.user.id
        },
        order: [
            ['createdAt', 'DESC']
        ]
    })

    return {
        props: {
            attempts: JSON.stringify(attempts),
        },
    }
}

type IAttemptTable = {
    id: number;
    score: number;
    total_time: number | string;
    createdAt: string;
}

function PageAccount({ attempts } : { attempts: string }) {
    const attemptsData = useMemo(() => JSON.parse(attempts) as IAttemptTable[], [attempts]);
    const router = useRouter();
    const { data: session } = useSession();

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
                <div className="flex items-center space-x-2">
                    <Link className="text-blue-500 hover:text-blue-700" href={`/account/history/${row.original.id}`}>Xem chi tiết</Link>
                </div>
            ),
          }
        ] as Array<ColumnDef<IAttemptTable, unknown>>, [columnHelper]
      );

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
                        <h1 className="text-2xl font-bold">Lịch sử làm bài</h1>
                        <Table data={attemptsData} columns={columns} />
                    </div>
                </div>
            </Container>
        </section>
        );
}

export default PageAccount;