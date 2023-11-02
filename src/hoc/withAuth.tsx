import { GetServerSidePropsContext } from 'next';
import { getSession } from 'next-auth/react';

/**
   * This function is a wrapper for getServerSideProps that checks if the user is authenticated and has the required roles.
   *
   * @param gssp - The getServerSideProps function to wrap.
   * @param roles - The roles required to access the page, if empty, the page is accessible to all authenticated users.
   * @param redirect - The redirect path if the user is not authenticated or does not have the required roles.
   * @returns The getServerSideProps function.
   *
   * @example
   * export const getServerSideProps = withAuth(async (context) => {
   *  return {
   *   props: {
   *     ....
   *   }
   *  }
   * }, ['admin'])
   * 
   *
*/
export function withAuth(gssp: any, roles: string[], redirect = '/dang-nhap') {
  return async function WithRolesWrapper(context: GetServerSidePropsContext) {
    const session = await getSession(context);
    if(!session) return {
        redirect: {
            destination: redirect,
            statusCode: 302,
        }
    }

    if(Object.keys(session.user).length === 0) return {
        redirect: {
            destination: redirect,
            statusCode: 302,
        }
    }

    const isAuthenticated = roles.some((permission) =>
        session.user?.role === permission
    )

    if (isAuthenticated || roles.length === 0) {
        return await gssp(context)
    } else {
        return {
            redirect: {
                destination: '/',
                statusCode: 302,
            }
        };
    }
  }
}
