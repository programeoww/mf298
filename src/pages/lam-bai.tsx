import Button from "@/components/button";
import { withAuth } from "@/hoc/withAuth";
import instance from "@/instance";
import IQuestion from "@/interfaces";
import { GetServerSidePropsContext } from "next";

export const getServerSideProps = withAuth(async (context: GetServerSidePropsContext) => {
    return {
        props: {
            
        }
    }
}, []);

function PageDoingQuiz() {
    return (
        <></>
    )
}

export default PageDoingQuiz;