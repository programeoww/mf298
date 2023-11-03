import Image from 'next/image'
import SVGCircle from '@/components/countdown'
import Container from '@/components/container'
import Chart from '@/components/chart'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import contestWeekData from '@/data/contestWeekData'
import moment from 'moment'
import { QuizAttemptModel, UserModel } from '@models'
import { Op } from 'sequelize'
import { useEffect, useState } from 'react'
import instance from '@/instance'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'

export const getServerSideProps : GetServerSideProps = async (context) => {
  const currentWeek = contestWeekData.findIndex((item) => {
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

  const top10 = (await QuizAttemptModel.findAll({
    order: [
      ['score', 'DESC'],
      ['total_time', 'ASC']
    ],
    attributes: ['id', 'score', 'total_time'],
    limit: 10,
    include: {
        model: UserModel,
        as: 'user',
        attributes: ['name', 'localUnit']
    },
    where: {
      createdAt: {
        [Op.between]: [contestWeekData[currentWeek == -1 ? nearestWeek : currentWeek].startTime, contestWeekData[currentWeek == -1 ? nearestWeek : currentWeek].endTime]
      }
    }
  })).map((item: any) => {
    const minutes = Math.floor(item.total_time / 60) 
    const seconds = item.total_time - minutes * 60
    const score = ((100 / 20) * Number(item.score)).toFixed(0)
    
    return {
      id: item.id,
      name: item.user.name,
      localUnit: item.user.localUnit,
      time: `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`,
      score
    }
  })

  const statistic = [];

  for (const week of contestWeekData) {
    const thisWeekAttempt = (await QuizAttemptModel.findAll({
      order: [
        ['score', 'DESC'],
        ['total_time', 'ASC']
      ],
      attributes: ['id', 'score', 'total_time'],
      include: {
          model: UserModel,
          as: 'user',
          attributes: ['name', 'localUnit','subLocalUnit']
      },
      where: {
        createdAt: {
          [Op.between]: [week.startTime, week.endTime]
        }
      }
    })).map((item: any) => {
      return {
        id: item.id,
        name: item.user.name,
        localUnit: item.user.localUnit + ' - ' + item.user.subLocalUnit,
      }
    })

    const localUnitHaveMostUserAttempt = thisWeekAttempt.length > 0 ? thisWeekAttempt.reduce((acc: any, curr: any) => {
      if (acc[curr.localUnit]) {
        acc[curr.localUnit]++
      } else {
        acc[curr.localUnit] = 1
      }
      return acc
    }, {}) : []

    statistic.push({
      labels: Object.keys(localUnitHaveMostUserAttempt).map((item: any) => item),
      datasets: [
        {
          label: 'Dataset 1',
          data: Object.keys(localUnitHaveMostUserAttempt).map((item: any) => localUnitHaveMostUserAttempt[item]),
          backgroundColor: '#47B26B',
        },
      ],
    })
  }

  return {
    props: {
      top10,
      statistic: JSON.parse(JSON.stringify(statistic))
    }
  }
}

type topItem = { 
  id: string | number, 
  name: string, 
  localUnit: string, 
  time: string,
  score: string
}

type Statistic = {
  labels: string[]
  datasets: Dataset[]
}

type Dataset = {
  label: string
  data: number[]
  backgroundColor: string
}

export default function Home({ top10, statistic } : { top10: topItem[], statistic: Statistic[] }) {  
  const [currentWeekSelect, setCurrentWeekSelect] = useState<string | number>(0)
  const { data: session } = useSession()
  const [timer, setTimer] = useState({
    days: 0,
    hours: 0,
    minute: 0,
    second: 0
  })
  const currentWeek = contestWeekData.findIndex((item) => {
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

  const getEndDate = () => {
    let i = 0
    while (contestWeekData[currentWeek ? i : currentWeek].endTime < moment().format() && i < contestWeekData.length - 1) {
      i++
    }
    return contestWeekData[currentWeek ? i : currentWeek].endTime
  }

  const endDate = getEndDate()
  const startDate = currentWeek === -1 ? contestWeekData[nearestWeek].startTime : contestWeekData[currentWeek].startTime

  useEffect(()=>{
    const interval = setInterval(()=>{
      const distance = currentWeek == -1 ? moment(startDate).diff(moment()) : moment(endDate).diff(moment())
      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minute = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const second = Math.floor((distance % (1000 * 60)) / 1000)
      setTimer({days, hours, minute, second})
    }, 1000)
    return () => clearInterval(interval)
  },[currentWeek, endDate, startDate])

  const router = useRouter()

  const handleStartQuiz = async () => {
    if(!session?.user) {
      router.push('/dang-nhap')
    }else{
      const {data} = await instance.post('/check')
      if(data.data) {
        router.push('/lam-bai')
      }else{
        toast.error(data.message)
      }
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center">
        <div className="lg:w-8/12 w-full">
          <div className="relative aspect-[2/1]">
            <Image src={'/assets/image8.jpg'} quality={100} alt="Hero" fill className="z-10 object-cover" />
          </div>
        </div>
        <div className="lg:w-4/12 w-full space-y-8 p-8">
          <h2 className='text-center font-bold text-[32px] leading-tight'>THỜI GIAN CÒN <br /> LẠI CUỘC THI</h2>
          <div className="flex mx-auto justify-center max-w-md lg:max-w-none">
            <div className="px-2 lg:px-3 w-4/12 lg:w-2/12 text-center">
              <div className='relative pointer-events-none'>
                <p className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold text-xl lg:text-2xl'>{3}</p>
                <SVGCircle total={currentWeek == -1 ? Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + Math.round(moment.duration(moment(startDate).diff(moment())).asDays()) : Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} bgColor='#E942334D' strokeColor='#E94233' value={timer.days} />
              </div>
              <p className='mt-3 text-lg'>Ngày</p>
            </div>
            <div className="px-2 lg:px-3 w-4/12 lg:w-2/12 text-center">
              <div className='relative pointer-events-none'>
                <p className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold text-xl lg:text-2xl'>{timer.hours}</p>
                <SVGCircle total={24} bgColor='#FFDC344D' strokeColor='#FFDC34' value={timer.hours} />
              </div>
              <p className='mt-3 text-lg'>Giờ</p>
            </div>
            <div className="px-2 lg:px-3 w-4/12 lg:w-2/12 text-center">
              <div className='relative pointer-events-none'>
                <p className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold text-xl lg:text-2xl'>{timer.minute}</p>
                <SVGCircle bgColor='#47B26B4D' strokeColor='#47B26B' value={timer.minute} />
              </div>
              <p className='mt-3 text-lg'>Phút</p>
            </div>
            <div className="px-2 lg:px-3 w-4/12 lg:w-2/12 text-center">
              <div className='relative pointer-events-none'>
                <p className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold text-xl lg:text-2xl'>{timer.second}</p>
                <SVGCircle bgColor='#457AE64D' strokeColor='#457AE6' value={timer.second} />
              </div>
              <p className='mt-3 text-lg'>Giây</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row font-semibold uppercase md:w-fit mx-auto -my-2">
            <div className="p-2">
              <Link href={'#the-le'} className="w-full block text-center bg-red-100 text-primary-400 py-[14px] px-6 rounded border border-primary-400 hover:bg-red-200 duration-150">XEM THỂ LỆ CUỘC THI</Link>
            </div>
            <div className="p-2">
              <button onClick={handleStartQuiz} className="w-full block text-center bg-primary-400 text-white py-[14px] px-6 rounded border border-primary-400 hover:bg-red-600 duration-150">VÀO THI NGAY</button>
            </div>
          </div>
          { session?.user && <button onClick={()=>signOut()} className="!mt-0 block mx-auto text-sm text-primary-400">Đăng xuất</button> }
        </div>
      </div>
      <div className="bg-[url('/assets/bg.jpg')] bg-cover pb-48 3xl:pb-64 pt-12 lg:pt-[100px]">
        <Container className='flex flex-wrap'>
          <div className='w-full lg:w-5/12 lg:px-6 leading-none'>
            <div className='px-4 py-3 space-x-1 bg-[#EBEDEF]'>
              <span className='w-3 h-3 bg-[#E94233] rounded-full inline-block'></span>
              <span className='w-3 h-3 bg-[#FFDC34] rounded-full inline-block'></span>
              <span className='w-3 h-3 bg-[#47B26B] rounded-full inline-block'></span>
            </div>
            <div className="py-6 px-4 bg-white space-y-8">
              <h3 className='font-bold text-[32px] leading-10 text-center'>Top 10</h3>
              <ul>
                {
                  top10.map((item, index) => (
                    <li key={index} className='odd:bg-[#EBEDEF] flex items-center px-3 py-2 rounded justify-between'>
                      <div className="w-10/12 flex items-center">
                        <span className='w-11 h-11 flex justify-center items-center bg-[#FFDC34] shrink-0 rounded-full font-bold'>{String(index + 1).padStart(2, '0')}</span>
                        <div className='ml-4 mr-2 space-y-1'>
                          <p className='font-bold'>{item.name}</p>
                          <p className='text-sm'>{item.localUnit}</p>
                        </div>
                        <p className='text-sm shrink-0 font-semibold text-[#47B26B] ml-auto'>{item.time}</p>
                      </div>
                      {
                        index == 0 && (
                          <div className='w-2/12 pl-5'>
                            <div className="relative aspect-square">
                              <Image src={`/assets/${index + 1}_badge.png`} alt="" quality={100} fill className='absolute h-full w-full top-0 bottom-0 left-0 right-0 object-contain' />
                            </div>
                          </div>
                        )
                      }
                      {
                        index == 1 && (
                          <div className='w-2/12 pl-5'>
                            <div className="relative aspect-square">
                              <Image src={`/assets/${index + 1}_badge.png`} alt="" quality={100} fill className='absolute h-full w-full top-0 bottom-0 left-0 right-0 object-contain' />
                            </div>
                          </div>
                        )
                      }
                      {
                        index == 2 && (
                          <div className='w-2/12 pl-5'>
                            <div className="relative aspect-square">
                              <Image src={`/assets/${index + 1}_badge.png`} alt="" quality={100} fill className='absolute h-full w-full top-0 bottom-0 left-0 right-0 object-contain' />
                            </div>
                          </div>
                        )
                      }
                    </li>
                  ))
                }
                {
                  top10.length == 0 && (
                    <li className='odd:bg-[#EBEDEF] flex items-center px-3 py-2 rounded justify-between'>
                      <div className="w-full flex items-center">
                        <p className='font-bold text-center w-full'>Chưa có dữ liệu</p>
                      </div>
                    </li>
                  )
                }
              </ul>
            </div>
          </div>
          <div className='w-full mt-10 lg:mt-0 lg:w-7/12 lg:px-6 leading-none self-stretch'>
            <div className='p-6 bg-white space-y-24 lg:space-y-14 lg:rounded-lg h-full relative'>
              <div className="absolute top-6 flex flex-col lg:flex-row gap-3 justify-between left-6 right-6">
                <h2 className='text-lg lg:text-xl font-bold flex space-x-2 uppercase items-center'>
                  <span className='w-1 my-[2px] rounded-r bg-yellow-500 block self-stretch'></span>
                  <span>SỐ LIỆU THỐNG KÊ</span>
                </h2>
                <select onChange={(e)=>setCurrentWeekSelect(e.target.value)} className='text-neutral-500 font-semibold px-3 py-[6px] text-sm outline-none border rounded'>
                  {
                    contestWeekData.map((item, index) => (
                      <option key={index} value={index}>{moment(item.startTime).format('DD/MM/YYYY')} - {moment(item.endTime).format('DD/MM/YYYY')}</option>
                    ))
                  }
                </select>
              </div>
              <Chart data={statistic[currentWeekSelect as any]} />
            </div>
          </div>
        </Container>
      </div>
    </>
  )
}
