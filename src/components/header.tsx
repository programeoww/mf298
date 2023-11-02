import Image from "next/image";
import Container from "./container";

function Header() {
    return (
        <>
            <header className="bg-[url('/assets/header-bg.png')]">
                <Container className="py-[21px] flex gap-4 justify-center lg:justify-between items-center">
                    <a href={'/'} className="w-1/3 lg:w-[unset]">
                        <Image src="/assets/logo.png" alt="logo" width={240} height={161} />
                    </a>
                    <h1 className="text-3xl lg:text-5xl font-bold">ĐẢNG BỘ <br className="lg:hidden" /> NAM TỪ LIÊM</h1>
                </Container>
            </header>
        </>
        
    );
}

export default Header;