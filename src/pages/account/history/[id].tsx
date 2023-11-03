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
import { QuizAnswerModel, QuizAttemptModel } from "@models";

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

    const attempts = await QuizAttemptModel.findOne({
        attributes: ['id', 'score', 'total_time', 'createdAt', 'file_path'],
        where: {
            user_id: session.user.id,
            id: context.params!.id
        },
        order: [
            ['createdAt', 'DESC']
        ],
        include: [
            {
                model: QuizAnswerModel,
                as: 'quiz_answers',
                attributes: ['id', 'question', 'answer'],
            }
        ]
    })

    if(!attempts){
        return {
            notFound: true
        }
    }
    
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
    file_path: string;
    quiz_answers: IQuizAnswer[];
}

type IQuizAnswer = {
    id: number;
    question: string;
    answer: string;
    timestamp: string;
}

function PageAccount({ attempts } : { attempts: string }) {
    const attemptsData = useMemo(() => JSON.parse(attempts) as IAttemptTable, [attempts]);
    const router = useRouter();
    const { data: session } = useSession();
    

    const columnHelper = useMemo(() => createColumnHelper<IQuizAnswer>(), []);

    const columns = useMemo(
        () => [
          {
            id: "index",
            header: "STT",
            cell: ({ row }) => row.index + 1,
          },
          columnHelper.accessor("question", {
            header: "Câu hỏi",
            cell: ({cell}) => <p className="max-w-lg">{cell.getValue()}</p>,
          }),
          columnHelper.accessor("answer", {
            header: "Câu trả lời",
            cell: ({cell}) => <p className="max-w-lg">{cell.getValue() || "Không trả lời"}</p>,
          }),
        ] as Array<ColumnDef<IQuizAnswer, unknown>>, [columnHelper]
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
                        {
                            attemptsData.file_path && <div className="flex space-x-2"><p>Tài liệu:</p> <Link target="_blank" className="text-[#196EDE]" href={attemptsData.file_path.replace('./', process.env.NEXT_PUBLIC_APP_URL!) + '?download=1'}>Tải xuống tài liệu</Link> </div>
                        }
                        <Table data={attemptsData.quiz_answers} columns={columns} />
                    </div>
                </div>
            </Container>
        </section>
        );
}

export default PageAccount;