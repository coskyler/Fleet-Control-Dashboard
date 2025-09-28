import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { useContext, useEffect, useState } from "react";
import SideBarRow from "./SidebarRow";
const apiDomain = import.meta.env.VITE_API_DOMAIN;

export default function Sidebar() {
    const navigate = useNavigate();
    const authCtx = useContext(AuthContext);

    const [rows, setRows] = useState<any[]>([]);

    const logout = async () => {
        const res = await fetch(`${apiDomain}/api/users/logout`, {
            method: 'POST',
            credentials: 'include'
        });

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
            authCtx?.setListUpToDate(false);
        }
    }

    useEffect(() => {
        if(authCtx?.listUpToDate) return;

        async function writeList() {
            const res = await fetch(`${apiDomain}/api/scans/list`, { credentials: 'include' });

            const body = await res.json();

            if(!body.success) { console.log('List error: ' + body.message); return; }

            setRows(body.rows);
            authCtx?.setListUpToDate(true);

        }
        writeList();
    }, [authCtx?.listUpToDate, authCtx?.authed]);

    return (
        <aside className="flex flex-col w-64 bg-neutral-900 text-white p-4 h-screen min-h-0">
            <img onClick={() => {navigate('/newscan')}} src="/media/fcdlogo128.png" className="cursor-pointer mb-4 w-[64px]"/>
            <div className={`flex flex-row gap-4 items-stretch w-full mb-6 ${authCtx?.authed === false && authCtx?.status === true ? "block" : "hidden"}`}>
                <button onClick={() => navigate('/login')} className={`flex-1 cursor-pointer bg-neutral-200 p-1 rounded-xl text-black font-semibold hover:bg-neutral-400 transition duration-100 active:bg-neutral-200`}>Log In</button>
                <button onClick={() => navigate('/signup')} className={`flex-1 cursor-pointer bg-neutral-200 p-1 rounded-xl text-black font-semibold hover:bg-neutral-400 transition duration-100 active:bg-neutral-200`}>Sign Up</button>
            </div>

            <button onClick={() => navigate('/dashboard')} className={`cursor-pointer bg-sliding-bars p-1 rounded-xl text-black font-semibold hover:opacity-80 transition duration-100 active:opacity-100 mb-6 ${authCtx?.unityID !== '-1' ? "block" : "hidden"}`}>Active Scan</button>

            <div className={`mb-6 ${authCtx?.unityID === '-1' ? "block" : "hidden"}`}>
                <span className={`block text-[16px] mb-2 font-semibold`}>Start Scan</span>
                <div className={`flex flex-row gap-4 items-stretch w-full`}>
                    <button onClick={() => navigate('/newscan')} className={`flex-1 cursor-pointer bg-neutral-800 p-1 rounded-xl text-white font-semibold hover:bg-neutral-700 transition duration-100 active:bg-neutral-800`}>New</button>
                    <button onClick={() => navigate('/spectate')} className={`flex-1 cursor-pointer bg-neutral-800 p-1 rounded-xl text-white font-semibold hover:bg-neutral-700 transition duration-100 active:bg-neutral-800`}>Spectate</button>
                </div>
            </div>

            <div className={`mb-4 ${authCtx?.authed === true ? "flex flex-col flex-1 min-h-0" : "hidden"}`}>
                <span className={`block text-[16px] mb-2 font-semibold`}>Scan History</span>
                <div className={`flex flex-col gap-2 overflow-y-auto flex-1 min-h-0 my-scrollbar`}>
                    {rows.map((row) => (
                        <SideBarRow key={row.scan_id} scanName={row.name} scanDateTime={row.created_at} scanLink={`/scans/${row.scan_id}`}></SideBarRow>
                    ))}
                </div>
            </div>

            <div className={`flex justify-between items-center mt-auto ${authCtx?.authed === true ? "visible" : "invisible"}`}>
                <span className={`block text-[16px]`}>{authCtx?.username}</span>
                <img onClick={() => logout()} src="/media/logouticon.png" className={`cursor-pointer w-[32px]`}/>
            </div>
        </aside>
    );
}