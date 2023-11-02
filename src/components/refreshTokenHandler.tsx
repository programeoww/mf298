import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { signOut } from "next-auth/react";

const RefreshTokenHandler = ({ setInterval } : { setInterval: (interval: number) => void }) => {
    const { data: session } = useSession();

    useEffect(() => {
        if(!!session) {
            const timeRemaining = Math.round((session as Session & { accessTokenExpiry: number }).accessTokenExpiry - Date.now());
            setInterval(timeRemaining > 0 ? timeRemaining : 0);
        }
    }, [setInterval]);

    useEffect(()=>{
        if(session?.error == 'Unauthorized') signOut()
    }, [session])

    return null;
}

export default RefreshTokenHandler;