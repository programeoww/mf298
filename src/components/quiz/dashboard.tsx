import Image from "next/image";
import StarIcon from "../star";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import instance from "@/services/instance";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import Button from "../button";
import InputPassword from "../inputPassword";
import { toast } from "react-toastify";
import { signOut } from "next-auth/react";
import moment from "moment";
import Link from "next/link";

type FormValues = {
  name: string,
  localUnit: string,
  phone: string,
  address: string,
  password: string;
  repassword: string;
  workingUnit: string;
}

function QuizDashboard({ localUnit, top10, setQuizProgress, isAuthenticated, setStartTime }: { setStartTime: Dispatch<SetStateAction<string>>, isAuthenticated: boolean, setQuizProgress: Dispatch<SetStateAction<"waiting" | "doing" | "finished">>, localUnit: { "STT": number | string, "Tên tổ chức trực thuộc": string }[], top10: { id: number | string, name: string, localUnit: string, time: string, score: string }[] }) {
  const { register, handleSubmit, formState: { errors }, setError, watch, control } = useForm<FormValues>();
  const [isSignIn, setIsSignIn] = useState<boolean>(false);
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true)
      if (!isSignIn && !isAuthenticated) {
        const res = await instance.post('auth/register', data);
        if (res.data.success === false) {
          res.data.errors.forEach((error: any) => {
            setError(error.path, { type: 'manual', message: error.message });
          })
        } else {
          await signIn('credentials', { phone: data.phone, password: data.password, callbackUrl: '/' });
          setIsLoading(false)
        }
      } else if (isSignIn && !isAuthenticated) {
        await signIn('credentials', { phone: data.phone, password: data.password, callbackUrl: '/' });
        setIsLoading(false)
      } else {
        const { data: response } = await instance.post('quiz/check')
        if (response.data) {
          setQuizProgress('doing');
          setStartTime(moment().format());
        } else {
          toast.error(response.message);
        }
        setIsLoading(false)
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false)
    }
  }

  return (
    <div className='flex flex-wrap justify-center items-start lg:-mx-6 space-y-10 lg:space-y-0'>
      <div className='w-full lg:w-1/2 lg:px-6 leading-none'>
        <div className='px-4 py-3 space-x-1 bg-[#EBEDEF]'>
          <span className='w-3 h-3 bg-[#E94233] rounded-full inline-block'></span>
          <span className='w-3 h-3 bg-[#FFDC34] rounded-full inline-block'></span>
          <span className='w-3 h-3 bg-[#47B26B] rounded-full inline-block'></span>
        </div>
        <form className="p-5 lg:p-12 bg-white space-y-8 relative" onSubmit={handleSubmit(onSubmit)}>
          <ul>
            <li className='flex items-start'>
              <StarIcon className='shrink-0' />
              <p className='leading-7 ml-2'>Cuộc thi được tổ chức với tinh thần nghiêm túc, thiết thực, tiết kiệm, hiệu quả, huy động được đông đảo sự tham gia của đoàn viên thanh niên trên địa bàn Quận tạo sự lan tỏa về ý nghĩa và nội dung của cuốn sách.</p>
            </li>
            <li className='flex items-start'>
              <StarIcon className='shrink-0' />
              <p className='leading-7 ml-2'>Tìm hiểu về truyền thống cách mạng hào hùng trong đấu tranh bảo vệ độc lập, tự do cũng như những thành tựu của quá trình đổi mới, hội nhập và phát triển của quận Hai Bà Trưng trong suốt 95 năm qua (1925 -2020).</p>
            </li>
            <li className='flex items-start'>
              <StarIcon className='shrink-0' />
              <p className='leading-7 ml-2'>Những đặc điểm về vùng đất, con người, truyền thống lịch sử, về quá trình thành lập, phát triển và lãnh đạo nhân dân đạt những thành tựu to lớn, vẻ vang qua các thời kỳ cách mạng và trong sự nghiệp đổi mới, công nghiệp hoá, hiện đại hoá hiện nay của quận Hai Bà Trưng.</p>
            </li>
            <li className='flex items-start'>
              <StarIcon className='shrink-0' />
              <p className='leading-7 ml-2'>Tìm hiểu các Nghị quyết lãnh đạo chỉ đạo của Đảng bộ Quận qua các thời kỳ, qua các kết quả nổi bật trên các mặt: kinh tế - xã hội, an ninh quốc phòng.</p>
            </li>
            <li className='flex items-start'>
              <StarIcon className='shrink-0' />
              <p className='leading-7 ml-2'>Tìm hiểu về quá trình sưu tầm, nghiên cứu, biên soạn lịch sử cách mạng và xuất bản cuốn Lịch sử cách mạng của Đảng bộ và nhân dân quận Hai Bà Trưng (1925 - 2020).</p>
            </li>
            <li className='flex items-start'>
              <StarIcon className='shrink-0' />
              <p className='leading-7 ml-2'>Bày tỏ tình cảm, những ý tưởng, sáng kiến, giải pháp xây dựng quận trong tương lai.</p>
            </li>
          </ul>
          {
            !isAuthenticated && !session ? (
              <div className="relative space-y-8">
                <div className='space-y-4'>
                  {
                    !isSignIn && (
                      <div>
                        <p className='font-bold mb-2'>Họ và tên</p>
                        <input {...register('name', { required: "Trường này là bắt buộc" })} type="text" placeholder='Nhập họ tên của bạn' className='bg-[#EBEDEF] border border-solid border-[#C8CFD6] w-full py-[14px] px-4 rounded placeholder:text-[#04142999]' />
                        {errors.name && <p className='text-red-500 text-sm mt-1'>{errors.name.message}</p>}
                      </div>
                    )
                  }
                  <div>
                    <p className='font-bold mb-2'>Số điện thoại</p>
                    <input {...register('phone', { required: "Trường này là bắt buộc", pattern: { value: /(84|0[3|5|7|8|9])+([0-9]{8})\b/g, message: "Số điện thoại không hợp lệ" } })} type="text" placeholder='Nhập số điện thoại của bạn' className='bg-[#EBEDEF] border border-solid border-[#C8CFD6] w-full py-[14px] px-4 rounded placeholder:text-[#04142999]' />
                    {errors.phone && <p className='text-red-500 text-sm mt-1'>{errors.phone.message}</p>}
                  </div>
                  {
                    !isSignIn && (
                      <>
                        <div>
                          <p className='font-bold mb-2'>Đang sinh hoạt tại Chi đoàn</p>
                          <input {...register('workingUnit', { required: "Trường này là bắt buộc" })} type="text" placeholder='Nhập chi đoàn của bạn' className='bg-[#EBEDEF] border border-solid border-[#C8CFD6] w-full py-[14px] px-4 rounded placeholder:text-[#04142999]' />
                          {errors.workingUnit && <p className='text-red-500 text-sm mt-1'>{errors.workingUnit.message}</p>}
                        </div>
                        <div>
                          <p className='font-bold mb-2'>Địa phương, đơn vị</p>
                          <select {...register('localUnit', { required: "Trường này là bắt buộc" })} className='bg-[#EBEDEF] border border-solid border-[#C8CFD6] w-full py-[14px] px-4 rounded placeholder:text-[#04142999]'>
                            <option value="">Chọn đơn vị</option>
                            {
                              localUnit.map((item, index) => (
                                <option key={index} value={item['Tên tổ chức trực thuộc']}>{item['Tên tổ chức trực thuộc']}</option>
                              ))
                            }
                          </select>
                          {errors.localUnit && <p className='text-red-500 text-sm mt-1'>{errors.localUnit.message}</p>}
                        </div>
                        <div>
                          <p className='font-bold mb-2'>Địa chỉ</p>
                          <input {...register('address', { required: "Trường này là bắt buộc" })} type="text" placeholder='Nhập địa chỉ của bạn' className='bg-[#EBEDEF] border border-solid border-[#C8CFD6] w-full py-[14px] px-4 rounded placeholder:text-[#04142999]' />
                          {errors.address && <p className='text-red-500 text-sm mt-1'>{errors.address.message}</p>}
                        </div>
                      </>
                    )
                  }
                  <div>
                    <p className='font-bold mb-2'>Mật khẩu</p>
                    <InputPassword control={control} name="password" rules={{ required: { value: true, message: 'Trường này là bắt buộc' }, minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' } }} placeholder='Nhập mật khẩu của bạn' className='bg-[#EBEDEF] border border-solid border-[#C8CFD6] w-full py-[14px] px-4 rounded placeholder:text-[#04142999]' />
                    {errors.password && <p className='text-red-500 text-sm'>{errors.password.message}</p>}
                  </div>
                  {
                    !isSignIn && (
                      <div>
                        <p className='font-bold mb-2'>Nhập lại mật khẩu</p>
                        <InputPassword control={control} name="repassword" rules={{ required: { value: true, message: 'Trường này là bắt buộc' }, validate: (value: string) => value === watch('password') || 'Mật khẩu không khớp' }} placeholder='Nhập mật khẩu của bạn' className='bg-[#EBEDEF] border border-solid border-[#C8CFD6] w-full py-[14px] px-4 rounded placeholder:text-[#04142999]' />
                        {errors.repassword && <p className='text-red-500 text-sm'>{errors.repassword.message}</p>}
                      </div>
                    )
                  }
                  <p className='text-[#04142999] text-sm'>* Vui lòng điền đầy đủ thông tin</p>
                  <p className="text-sm">{!isSignIn ? 'Đã' : 'Chưa'} có tài khoản ? <span onClick={() => setIsSignIn(!isSignIn)} className="text-[#1A73E8] cursor-pointer">{!isSignIn ? 'Đăng nhập' : 'Đăng ký'}</span></p>
                </div>
                <Button isLoading={isLoading} type='submit' className='py-[14px] px-6 font-semibold bg-[#1A73E8] text-white rounded'>{isSignIn ? 'Đăng nhập' : 'Đăng ký'}</Button>
              </div>
            ) :
              (
                <div className="relative space-y-8">
                  <div className='space-y-4'>
                    <div>
                      <p className='font-bold mb-2'>Họ và tên</p>
                      <p className="bg-[#EBEDEF] border leading-snug border-solid border-[#C8CFD6] w-full py-[14px] px-4 rounded placeholder:text-[#04142999]">{session?.user.name}</p>
                    </div>
                    <div>
                      <p className='font-bold mb-2'>Số điện thoại</p>
                      <p className="bg-[#EBEDEF] border leading-snug border-solid border-[#C8CFD6] w-full py-[14px] px-4 rounded placeholder:text-[#04142999]">{session?.user.phone}</p>
                    </div>
                    <div>
                      <p className='font-bold mb-2'>Địa phương, đơn vị</p>
                      <p className="bg-[#EBEDEF] border leading-snug border-solid border-[#C8CFD6] w-full py-[14px] px-4 rounded placeholder:text-[#04142999]">{session?.user.localUnit}</p>
                    </div>
                    <div>
                      <p className='font-bold mb-2'>Đang sinh hoạt tại Chi đoàn</p>
                      <p className="bg-[#EBEDEF] border leading-snug border-solid border-[#C8CFD6] w-full py-[14px] px-4 rounded placeholder:text-[#04142999]">{session?.user.workingUnit}</p>
                    </div>
                    <div>
                      <p className='font-bold mb-2'>Địa chỉ</p>
                      <p className="bg-[#EBEDEF] border leading-snug border-solid border-[#C8CFD6] w-full py-[14px] px-4 rounded placeholder:text-[#04142999]">{session?.user.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between flex-wrap">
                    <Button isLoading={isLoading} type='submit' className='py-[14px] px-6 font-semibold bg-[#1A73E8] text-white rounded'>Vào thi</Button>
                    <p onClick={() => signOut()} className='cursor-pointer hover:underline text-[#1A73E8]'>Đăng xuất</p>
                    {
                      session && session.user && session.user.role === "admin" && (
                        <Link href="/account" className='cursor-pointer mt-5 hover:underline text-[#1A73E8] basis-full'>Trang quản lý tài khoản</Link>
                      )
                    }
                  </div>
                </div>
              )
          }
        </form>
      </div>
      <div className='w-full lg:w-1/2 lg:px-6 leading-none'>
        <div className='px-4 py-3 space-x-1 bg-[#EBEDEF]'>
          <span className='w-3 h-3 bg-[#E94233] rounded-full inline-block'></span>
          <span className='w-3 h-3 bg-[#FFDC34] rounded-full inline-block'></span>
          <span className='w-3 h-3 bg-[#47B26B] rounded-full inline-block'></span>
        </div>
        <div className="p-5 lg:p-12 bg-white space-y-8">
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
                    <p className='text-sm shrink-0 font-semibold text-[#47B26B] ml-auto'>{item.time}{" | "}{item.score}</p>
                  </div>
                  {
                    index == 0 && (
                      <div className='w-2/12 pl-5'>
                        <div className="relative aspect-square">
                          <Image src={`/images/${index + 1}_badge.png`} alt="" quality={100} fill className='absolute h-full w-full top-0 bottom-0 left-0 right-0 object-contain' />
                        </div>
                      </div>
                    )
                  }
                  {
                    index == 1 && (
                      <div className='w-2/12 pl-5'>
                        <div className="relative aspect-square">
                          <Image src={`/images/${index + 1}_badge.png`} alt="" quality={100} fill className='absolute h-full w-full top-0 bottom-0 left-0 right-0 object-contain' />
                        </div>
                      </div>
                    )
                  }
                  {
                    index == 2 && (
                      <div className='w-2/12 pl-5'>
                        <div className="relative aspect-square">
                          <Image src={`/images/${index + 1}_badge.png`} alt="" quality={100} fill className='absolute h-full w-full top-0 bottom-0 left-0 right-0 object-contain' />
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
    </div>
  );
}

export default QuizDashboard;