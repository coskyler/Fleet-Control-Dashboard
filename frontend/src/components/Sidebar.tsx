import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { useContext } from "react";
const apiDomain = import.meta.env.VITE_API_DOMAIN;

export default function Sidebar() {
    const navigate = useNavigate();
    const authCtx = useContext(AuthContext);

    const logout = async () => {
        const res = await fetch(`${apiDomain}/api/users/logout`, {
            method: 'POST',
            credentials: 'include'
        })

        if(!res.ok) {
            console.log('Logout error: ' + res.status);
        }

        const body = await res.json();
        if(body.success) {
            navigate('/newscan');
            authCtx?.setAuth(false);
            authCtx?.setUnityID('-1');
            authCtx?.setUsername('');
            authCtx?.setUserID('-1');
        }
    }

    return (
        <aside className="flex flex-col items-center w-64 bg-neutral-900 text-white p-4">
            <h2 onClick={() => {navigate('/newscan')}} className="cursor-pointer text-[30px] font-bold mb-4">FCD</h2>
            <div className={`flex flex-row gap-4 items-stretch w-full ${authCtx?.authed === false && authCtx?.status === true ? "visible" : "invisible"}`}>
                <button onClick={() => navigate('/login')} className={`flex-1 cursor-pointer bg-neutral-200 p-1 rounded-xl text-black font-semibold hover:bg-neutral-400 transition duration-100 active:bg-neutral-200`}>Log In</button>
                <button onClick={() => navigate('/signup')} className={`flex-1 cursor-pointer bg-neutral-200 p-1 rounded-xl text-black font-semibold hover:bg-neutral-400 transition duration-100 active:bg-neutral-200`}>Sign Up</button>
            </div>

            <span className={`text-[16px] font-bold mb-4 ${authCtx?.authed === true ? "visible" : "invisible"}`}>Welcome</span>

            <button onClick={() => logout()} className={`w-full mt-auto cursor-pointer bg-red-400 p-1 rounded-xl text-black font-semibold hover:bg-red-500 transition duration-100 active:bg-red-400 ${authCtx?.authed === true ? "visible" : "invisible"}`}>Log Out</button>
        </aside>
    );
}