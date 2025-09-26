import { createContext, useState, useEffect, type ReactNode } from "react";
const apiDomain = import.meta.env.VITE_API_DOMAIN;

type AuthContextType = {
    authed: boolean,
    userID: string,
    username: string,
    unityID: string,
    status: boolean,
    listUpToDate: boolean,
    setAuth: React.Dispatch<React.SetStateAction<boolean>>,
    setUserID: React.Dispatch<React.SetStateAction<string>>,
    setUsername: React.Dispatch<React.SetStateAction<string>>,
    setUnityID: React.Dispatch<React.SetStateAction<string>>,
    setListUpToDate: React.Dispatch<React.SetStateAction<boolean>>
}

type UserResponse = {
    authed: boolean,
    success: boolean;
    userID: string;
    username: string;
    unityID: string;
    message: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authed, setAuth] = useState(false);
    const [userID, setUserID] = useState('-1');
    const [username, setUsername] = useState('');
    const [unityID, setUnityID] = useState('-1');
    const [status, setStatus] = useState(false)
    const [listUpToDate, setListUpToDate] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            const res = await fetch(`${apiDomain}/api/users/me`, { credentials: 'include' });

            const body: UserResponse = await res.json();
            
            if(body.success)  {
                setAuth(body.authed);
                setUserID(body.userID);
                setUsername(body.username);
                setUnityID(body.unityID)
            } else {
                console.log("Failed getting user info: " + body.message);
            }

            setStatus(true);
            setListUpToDate(false);
            console.log(`
                authed: ${body.authed}
                userID: ${body.userID}
                username: ${body.username}
                unityID: ${body.unityID}
                status: true
            `);

        }

        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ authed, userID, username, unityID, status, listUpToDate, setAuth, setUserID, setUsername, setUnityID, setListUpToDate }}>
            {children}
        </AuthContext.Provider>
    )
}