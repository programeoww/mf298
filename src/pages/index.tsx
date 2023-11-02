import Image from 'next/image'
import { Inter } from 'next/font/google'
import SVGCircle from '@/components/countdown'
import Container from '@/components/container'
import Chart from '@/components/chart'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import axios from 'axios'
import { useEffect } from 'react'
import csvtojson from 'csvtojson'

const inter = Inter({ subsets: ['latin'] })

const top10 = [{"id":6084,"name":"Vương Thiên Phú","localUnit":"Đoàn TNCS Hồ Chí Minh Trường THPT Hồng Hà","time":"0:26","score":"100"},{"id":6060,"name":"Nguyễn Phan Mỹ Duyên","localUnit":"Đoàn TNCS Hồ Chí Minh Trường THPT Hồng Hà","time":"0:26","score":"100"},{"id":6075,"name":"Phạm Thục Anh","localUnit":"Đoàn TNCS Hồ Chí Minh Trường THPT Hồng Hà","time":"0:27","score":"100"},{"id":6050,"name":"Nguyễn Minh Anh","localUnit":"Đoàn TNCS Hồ Chí Minh Trường THPT Hồng Hà","time":"0:27","score":"100"},{"id":5998,"name":"Lê Nam Phương","localUnit":"Đoàn TNCS Hồ Chí Minh Trường THPT Hồng Hà","time":"0:28","score":"100"},{"id":6066,"name":"Lâm Đức Hiếu","localUnit":"Đoàn TNCS Hồ Chí Minh Trường THPT Hồng Hà","time":"0:28","score":"100"},{"id":6057,"name":"Vũ Tam Bách","localUnit":"Đoàn TNCS Hồ Chí Minh Trường THPT Hồng Hà","time":"0:28","score":"100"},{"id":5995,"name":"Đặng Hồng Lịch","localUnit":"Đoàn TNCS Hồ Chí Minh Trường THPT Hồng Hà","time":"0:28","score":"100"},{"id":6076,"name":"Nguyễn Trọng Nghĩa","localUnit":"Đoàn TNCS Hồ Chí Minh Trường THPT Hồng Hà","time":"0:29","score":"100"},{"id":6073,"name":"Nguyễn Văn Hải Nam","localUnit":"Đoàn TNCS Hồ Chí Minh Trường THPT Hồng Hà","time":"0:29","score":"100"}]

export default function Home() {
  const { data: session } = useSession()
  useEffect(() => {
    (async () => {
      const { data } = await axios.get<string>('https://docs.google.com/spreadsheets/d/e/2PACX-1vRBBUlRVFMO908C0EMBHeyxOMw-2euDDb55AqZVVB5NOpNpPROpTKfa_Vn_730bS8MvJ1N0w-wW9bdj/pub?output=csv')
      csvtojson().fromString(data).then((json) => console.log(json))
    })()
  }, [])

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
                <SVGCircle total={24} bgColor='#E942334D' strokeColor='#E94233' value={3} />
              </div>
              <p className='mt-3 text-lg'>Ngày</p>
            </div>
            <div className="px-2 lg:px-3 w-4/12 lg:w-2/12 text-center">
              <div className='relative pointer-events-none'>
                <p className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold text-xl lg:text-2xl'>{2}</p>
                <SVGCircle total={24} bgColor='#FFDC344D' strokeColor='#FFDC34' value={2} />
              </div>
              <p className='mt-3 text-lg'>Giờ</p>
            </div>
            <div className="px-2 lg:px-3 w-4/12 lg:w-2/12 text-center">
              <div className='relative pointer-events-none'>
                <p className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold text-xl lg:text-2xl'>{4}</p>
                <SVGCircle bgColor='#47B26B4D' strokeColor='#47B26B' value={4} />
              </div>
              <p className='mt-3 text-lg'>Phút</p>
            </div>
            <div className="px-2 lg:px-3 w-4/12 lg:w-2/12 text-center">
              <div className='relative pointer-events-none'>
                <p className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold text-xl lg:text-2xl'>{32}</p>
                <SVGCircle bgColor='#457AE64D' strokeColor='#457AE6' value={32} />
              </div>
              <p className='mt-3 text-lg'>Giây</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row font-semibold uppercase md:w-fit mx-auto -my-2">
            <div className="p-2">
              <button className="w-full bg-red-100 text-primary-400 py-[14px] px-6 rounded border border-primary-400 hover:bg-red-200 duration-150">XEM THỂ LỆ CUỘC THI</button>
            </div>
            <div className="p-2">
              <Link href={'/lam-bai'} className="w-full block bg-primary-400 text-white py-[14px] px-6 rounded border border-primary-400 hover:bg-red-600 duration-150">VÀO THI NGAY</Link>
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
              </ul>
            </div>
          </div>
          <div className='lg:w-7/12 lg:px-6 leading-none self-stretch'>
            <div className='p-6 bg-white space-y-14 rounded-lg h-full relative'>
              <div className="absolute top-6 flex justify-between left-6 right-6">
                <h2 className='text-xl font-bold flex space-x-2 uppercase items-center'>
                  <span className='w-1 my-[2px] rounded-r bg-yellow-500 block self-stretch'></span>
                  <span>SỐ LIỆU THỐNG KÊ</span>
                </h2>
                <select className='text-neutral-500 font-semibold px-3 py-[6px] text-sm outline-none border rounded'>
                  <option value="">31/01/2023 - 08/03/2023</option>
                </select>
              </div>
              <Chart />
            </div>
          </div>
        </Container>
      </div>
    </>
  )
}
