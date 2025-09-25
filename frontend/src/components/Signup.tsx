import { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
const apiDomain = import.meta.env.VITE_API_DOMAIN;

export default function SignUp() {
    const authCtx = useContext(AuthContext);
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [verifyPassword, setVerifyPassword] = useState('');

    const cleanUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
        const cleaned = e.target.value
            .replace(/[^a-zA-Z0-9 @#\-_.]/g, '') // remove disallowed characters
            .replace(/\s{2,}/g, ' ') // remove multiple spaces
            .trim() // remove leading/trailing spaces
            .slice(0, 50); // limit to 50 chars

        setUsername(cleaned);
    };

    const signUp = async () => {
        if (password !== verifyPassword) {
            alert("Passwords do not match!");
            return;
        }
        
        const res = await fetch(`${apiDomain}/api/users/create`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password }),
            credentials: "include"
        });

        const body = await res.json();

        if(!body.success) {
            console.log('Signup error: ' + body.message);
            return;
        }

        authCtx?.setAuth(true);
        authCtx?.setUserID(body.user.id);
        authCtx?.setUsername(body.user.username);
        navigate('/newscan');
    };

    return (
        <main className="h-full flex flex-col justify-center items-center bg-neutral-800 p-6 text-white">
            <h1 className="text-3xl mb-8">Sign Up</h1>
            <div className="w-full max-w-150 bg-neutral-700 rounded-3xl overflow-hidden">
                <div className="flex">
                    <div className="w-1/4 bg-neutral-600 px-6 pt-3 pb-3">Username</div>
                    <input
                        type="text"
                        value={username}
                        maxLength={50}
                        onChange={(e) => setUsername(e.target.value)}
                        onBlur={cleanUsername}
                        className="flex-1 px-6 placeholder:text-neutral-400 outline-none"
                    />
                </div>
                <div className="h-0.5 bg-neutral-800" />
                <div className="flex">
                    <div className="w-1/4 bg-neutral-600 px-6 pb-3 pt-3">Password</div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex-1 px-6 placeholder:text-neutral-400 outline-none"
                    />
                </div>
                <div className="h-0.5 bg-neutral-800" />
                <div className="flex">
                    <div className="w-1/4 bg-neutral-600 px-6 pb-3 pt-3">Verify</div>
                    <input
                        type="password"
                        value={verifyPassword}
                        maxLength={128}
                        onChange={(e) => setVerifyPassword(e.target.value)}
                        className="flex-1 px-6 placeholder:text-neutral-400 outline-none"
                    />
                </div>
            </div>
            <button
                onClick={signUp}
                className="cursor-pointer mb-6 bg-neutral-200 p-2 rounded-xl mt-6 text-black font-semibold hover:bg-neutral-400 transition duration-100 active:bg-neutral-200"
            >
                Sign Up
            </button>
        </main>
    );
}