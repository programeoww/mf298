import Image from "next/image";
import Container from "./container";

function Footer() {
    return (
        <>
            <footer className="relative bg-[url('/assets/JW1.jpg')] bg-cover">
                <div className="relative pt-[56.25%] 3xl:-mb-[27rem] md:pt-[40%] xl:pt-[23%] lg:pt-[35%] -translate-y-[60%] -mb-36 xl:-mb-80 md:-mb-64 pointer-events-none">
                    <Image src={'/assets/Capa_1.png'} quality={100} alt="Capa_1" fill className="z-10 xl:object-contain object-cover" />
                </div>
                <Container className="py-12 lg:py-[100px]">
                    <div className="flex flex-wrap font-bold text-[28px] -m-3 lg:-m-8" id="the-le">
                        <div className="md:w-1/3 flex flex-col justify-end w-full p-4 lg:p-8 text-center space-y-8">
                            <h4>THỂ LỆ CUỘC THI</h4>
                            <div className="relative pt-[100%]">
                                <Image src={'/assets/QR1.svg'} quality={100} alt="Capa_1" fill className="z-10 object-contain" />
                            </div>
                        </div>
                        <div className="md:w-1/3 flex flex-col justify-end w-full p-4 lg:p-8 text-center space-y-8">
                            <h4>KẾ HOẠCH</h4>
                            <div className="relative pt-[100%]">
                                <Image src={'/assets/QR2.svg'} quality={100} alt="Capa_1" fill className="z-10 object-contain" />
                            </div>
                        </div>
                        <div className="md:w-1/3 flex flex-col justify-end w-full p-4 lg:p-8 text-center space-y-8">
                            <h4>KẾT NỐI VỚI CHÚNG TÔI</h4>
                            <iframe src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Ffacebook&tabs=timeline&width=1080&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId" width={'100%'} className="md:h-52 lg:h-[350px]" style={{border: 'none', overflow: 'hidden'}} allowFullScreen allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" />
                        </div>
                    </div>
                </Container>
                <div className="bg-primary-400 text-white">
                    <Container className="py-12 !max-w-3xl space-y-4">
                        <h1 className="uppercase font-bold text-xl">CỔNG THÔNG TIN ĐIỆN TỬ QUẬN NAM TỪ LIÊM - TP. HÀ NỘI</h1>
                        <ul className="space-y-2">
                            <li>Địa chỉ: <span className="font-bold">125 Đường Hồ Tùng Mậu, Phường Cầu Diễn, Quận Nam Từ Liêm, Thành phố Hà Nội</span></li>
                            <li>Điện thoại: <span className="font-bold">024.38372950</span></li>
                            <li>Email: <span className="font-bold">vanthu_namtuliem@hanoi.gov.vn</span></li>
                        </ul>
                    </Container>
                </div>
            </footer>
            <div className="bg-[url('/assets/header-bg.png')] py-3 text-sm">
                <Container className="text-center">
                    <p>Powered by <a href="https://thietkewebfindme.com/" className="text-neutral-700 font-semibold" target="_blank">Thiết kế website Findme</a></p>
                </Container>
            </div>
        </>
    );
}

export default Footer;