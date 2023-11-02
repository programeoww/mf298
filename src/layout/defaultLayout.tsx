import Footer from "@/components/footer";
import Header from "@/components/header";

function DefaultLayout({children} : {children: React.ReactNode}) {
    return (
      <div className="text-[#041429]">
        <Header />
        <main className="">{children}</main>
        <Footer />
      </div>
    );
}

export default DefaultLayout;