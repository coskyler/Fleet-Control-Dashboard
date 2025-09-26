import ScanRenderer from './ScanRenderer';
import { WsContext } from '../contexts/ScanWsContext';
import { AuthContext } from '../contexts/AuthContext';
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const apiDomain = import.meta.env.VITE_API_DOMAIN;

export default function Dashboard() {
    const wsCtx = useContext(WsContext);
    const authCtx = useContext(AuthContext);

    const navigate = useNavigate();

    console.log("rendered the dashboard");
    
    useEffect(() => {
        if(authCtx?.status === false) return;

        async function reconnect() {
            if(wsCtx?.status.current === 'uninitialized') {
                wsCtx.status.current = 'connecting';
                const unityID = authCtx?.unityID || '-1';
                console.log("Tried reconnecting with ", unityID);
                if(unityID === "-1") {
                    console.log('No existing scan');
                    navigate('/newScan');
                    return;
                } else {
                    const connection: string | undefined = await wsCtx?.openWs(unityID, '');
                    if(connection !== 'Connecting') {
                        console.log('connection err:\n', connection);
                        navigate('/newScan');
                        return;
                    }
                }
            }
        }
        reconnect();
    }, [wsCtx, authCtx]);

    const saveScan = async () => {
        const res = await fetch(`${apiDomain}/api/scans/save`, {
            method: "POST",
            credentials: "include"
        });

        const body = await res.json();

        if(!body.success) { console.log('Error saving scan: ' + body.message); return; }

        console.log('Scan saved!')
        authCtx?.setUnityID('-1');
        navigate(`/scans/${body.scan_id}`);
        authCtx?.setListUpToDate(false);
    }

    const discardScan = async () => {
        const res = await fetch(`${apiDomain}/api/scans/discard`, {
            method: "POST",
            credentials: "include"
        });

        const body = await res.json();

        if(!body.success) { console.log('Error discarding scan: ' + body.message); return; }

        console.log('Scan discarded!')
        authCtx?.setUnityID('-1');
        navigate('/newscan');
    }

    return  (
        <main className="h-full flex flex-col bg-neutral-800 p-6 text-white">
            <h1 className="text-3xl mb-4">Untitled Scan</h1>
            
            <section className="flex-1 flex">
                <aside className="w-64 bg-neutral-700 rounded-xl mr-2">
                    
                </aside>
                <div className="flex-1 bg-neutral-700 rounded-xl">
                    <ScanRenderer voxelsRef={wsCtx?.voxels}/>
                </div>
            </section>

            <section className="flex mt-2">
                <div className="w-64 mr-2"></div>
                
                <div className="relative flex-1 flex justify-center gap-4">
                    <button onClick={() => {wsCtx?.startScan()}} className={`cursor-pointer absolute left-0 font-semibold text-black bg-neutral-200 px-3 py-1 rounded-xl hover:bg-neutral-400 transition duration-100 active:bg-neutral-200 ${wsCtx?.status.current === 'live' ? 'flex' : 'invisible'}`}>Start Scan</button>
                    <button onClick={() => {wsCtx?.dispatch()}} className={`cursor-pointer font-semibold text-black bg-neutral-200 px-3 py-1 rounded-xl  hover:bg-neutral-400 transition duration-100 active:bg-neutral-200 ${wsCtx?.status.current === 'live_scanning' ? 'flex' : 'hidden'}`}>Dispatch</button>
                    <button onClick={() => {wsCtx?.recall()}} className={`cursor-pointer font-semibold text-black bg-neutral-200 px-3 py-1 rounded-xl  hover:bg-neutral-400 transition duration-100 active:bg-neutral-200 ${wsCtx?.status.current === 'live_scanning' ? 'flex' : 'hidden'}`}>Recall</button>
                    <button onClick={() => {saveScan()}} className={`cursor-pointer font-semibold text-black bg-neutral-200 px-3 py-1 rounded-xl  hover:bg-neutral-400 transition duration-100 active:bg-neutral-200 ${wsCtx?.status.current === 'completed' ? 'flex' : 'hidden'}`}>Save Scan</button>
                    <button onClick={() => {discardScan()}} className={`cursor-pointer font-semibold text-black bg-neutral-200 px-3 py-1 rounded-xl  hover:bg-neutral-400 transition duration-100 active:bg-neutral-200 ${wsCtx?.status.current === 'completed' ? 'flex' : 'invisible'}`}>Discard Scan</button>
                    <button onClick={() => {wsCtx?.endScan()}} className={`cursor-pointer absolute text-black right-0 font-semibold bg-red-400 px-3 py-1 rounded-xl hover:bg-red-500 transition duration-100 active:bg-red-400 ${wsCtx?.status.current === 'live_scanning' ? 'completed' : 'invisible'}`}>End Scan</button>
                </div>
            </section>
        </main>
    );
}