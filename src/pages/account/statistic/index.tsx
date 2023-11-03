import { getSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import Container from "@/components/container";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { navList } from "..";
import { Op } from "sequelize";
import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { QuizAttemptModel, UserModel } from "@models";
import contestWeekData from "@/data/contestWeekData";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import instance from "@/instance";
import Table from "@/components/table";

type topItem = { 
  id: string | number, 
  name: string, 
  localUnit: string, 
  time: string,
  score: string,
  createdAt: string
  phone: string
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session || !session.user || session.user.role !== "admin") {
    return {
      redirect: {
        destination: "/dang-nhap?callbackUrl=/account",
        permanent: true,
      },
    };
  }

  const userCount = await UserModel.count({
    where: {
      [Op.not]: {
        role: "admin",
      },
    },
  });

  const currentWeek = context.query?.week ? Number(context.query?.week) - 1 : contestWeekData.findIndex((item) => {
    const startTime = moment(item.startTime)
    const endTime = moment(item.endTime)
    const currentTime = moment().format()
    return moment(currentTime).isBetween(startTime, endTime)
  })

  const nearestWeek = contestWeekData.findIndex((item) => {
    const startTime = moment(item.startTime)
    const currentTime = moment().format()
    return moment(currentTime).isBefore(startTime)
  })

  const topWeek = (await QuizAttemptModel.findAll({
    order: [
      ['score', 'DESC'],
      ['total_time', 'ASC']
    ],
    attributes: ['id', 'score', 'total_time', 'createdAt'],
    include: {
        model: UserModel,
        as: 'user',
        attributes: ['name', 'localUnit','phone']
    },
    where: {
      createdAt: {
        [Op.between]: [contestWeekData[currentWeek === -1 ? nearestWeek : currentWeek].startTime, contestWeekData[currentWeek === -1 ? nearestWeek : currentWeek].endTime]
      }
    }
  })).map((item: any) => {
    const minutes = Math.floor(item.total_time / 60) 
    const seconds = item.total_time - minutes * 60
    const score = ((100 / 20) * Number(item.score)).toFixed(0)
    
    return {
      id: item.id,
      name: item.user?.name || '',
      localUnit: item.user?.localUnit || '',
      time: `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`,
      score,
      createdAt: moment(item.createdAt).format('DD/MM/YYYY HH:mm:ss'),
      phone: item.user?.phone || '',
    }
  })

  return {
    props: {
      userCount,
      topWeek
    },
  };
};

function PageStatistic({ userCount: count, topWeek } : { userCount: number, topWeek: topItem[] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [userCount, setUserCount] = useState<number>(count);

  const columnHelper = useMemo(() => createColumnHelper<topItem>(), []);

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
          columnHelper.accessor("time", {
            header: "Thời gian",
          }),
          columnHelper.accessor("score", {
            header: "Điểm",
          }),
          columnHelper.accessor("createdAt", {
            header: "Ngày thi",
          }),
        ] as Array<ColumnDef<topItem, unknown>>, [columnHelper]
      );

  useEffect(() => {
    const interval = setInterval(async () => {
        const { data: { data } } = await instance.get('/statistic');
        setUserCount(data.userCount);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    session && (
      <section className="bg-[url('/assets/bg.jpg')] bg-cover pb-36 md:pb-56 3xl:pb-80 pt-12">
        <Container className="">
          <div className="flex flex-wrap space-y-8 lg:space-y-0 lg:divide-x bg-white p-12 rounded">
            <div className="w-full lg:w-1/4 space-y-5">
              <div className="flex items-center space-x-5">
                <div className="w-20 h-20 overflow-hidden bg-gray-300 rounded-full flex items-center justify-center">
                  <Image
                    src="/assets/avatar.jpg"
                    width={80}
                    height={80}
                    alt="avatar"
                  />
                </div>
                <p>
                  {session.user?.name}{" "}
                  <span className="text-gray-400 italic">
                    #{session.user?.id}
                  </span>
                </p>
              </div>
              <ul className="divide-y uppercase">
                {navList.map((item, index) => {
                  if (item.isAdmin && session.user?.role != "admin") return null;
                  return (
                    <li key={index}>
                      <Link
                        className={`${
                          router.pathname == item.path
                            ? "text-gray-700"
                            : "text-gray-400 hover:text-gray-700"
                        } duration-150 p-2 w-full block`}
                        href={item.path}
                      >
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
                <li
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-gray-400 hover:text-gray-700 duration-150 p-2 w-full block cursor-pointer"
                >
                  Thoát
                </li>
              </ul>
            </div>
            <div className="w-full lg:w-3/4 lg:pl-8 space-y-5">
              <h1 className="text-2xl font-bold">Thống kê</h1>
              <div className="w-full spacey-5">
                <p className="py-2">Số lượng người tham gia: {userCount}</p>
                <p className="text-lg font-bold">Top tuần</p>
                <Table globalFilterEnable data={topWeek} columns={columns} />
              </div>
            </div>
          </div>
        </Container>
      </section>
    )
  );
}

export default PageStatistic;
