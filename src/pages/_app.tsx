import '@/styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import Layout from '@/layout/defaultLayout'
import NextNProgress from 'nextjs-progressbar'
import Head from 'next/head'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App({ Component, pageProps }: AppProps) {
  return <SessionProvider>
    <NextNProgress />
    <Layout>
      <Head>
        <title>Cuộc thi trực tuyến</title>
      </Head>
      <Component {...pageProps} />
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="light"
      />
    </Layout>
  </SessionProvider>
}
