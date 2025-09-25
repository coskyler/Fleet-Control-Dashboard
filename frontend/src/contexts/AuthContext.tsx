import { createContext, useState, useEffect, type ReactNode } from "react";
const apiDomain = import.meta.env.VITE_API_DOMAIN;

type AuthContextType = {
    authed: boolean,
    userID: string,
    username: string,
    unityID: string,
    status: boolean;
    setAuth: React.Dispatch<React.SetStateAction<boolean>>;
    setUserID: React.Dispatch<React.SetStateAction<string>>;
    setUsername: React.Dispatch<React.SetStateAction<string>>;
    setUnityID: React.Dispatch<React.SetStateAction<string>>;
}

type UserResponse = {
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

    useEffect(() => {
        async function fetchUser() {
            const res = await fetch(`${apiDomain}/api/users/me`, { credentials: 'include' });

            const body: UserResponse = await res.json();
            
            if(body.success)  {
                setAuth(true);
                setUserID(body.userID);
                setUsername(body.username);
                setUnityID(body.unityID)
            } else {
                console.log("Failed getting user info: " + body.message);
            }

            setStatus(true);
            console.log(`
                authed: ${body.success}
                userID: ${body.userID}
                username: ${body.username}
                unityID: ${body.unityID}
                status: true
            `);

        }

        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ authed, userID, username, unityID, status, setAuth, setUserID, setUsername, setUnityID }}>
            {children}
        </AuthContext.Provider>
    )
}