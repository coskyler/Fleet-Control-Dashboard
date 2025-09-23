import ScanRenderer from './ScanRenderer';
import { WsContext } from '../websocket/ScanWsContext';
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const wsCtx = useContext(WsContext);

    const navigate = useNavigate();

    console.log("rendered the dashboard");
    
    useEffect(() => {
        async function reconnect() {
            if(wsCtx?.status.current === 'uninitialized') {
                wsCtx.status.current = 'connecting';
                const unityID = await (await fetch("https://localhost:8080/api/scans/getUnityID", { credentials: "include" })).text();
                console.log("Tried reconnecting with ", unityID);
                if(unityID === "No mangos") {
                    console.log('No mangos, scan expired');
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
    }, [wsCtx]);

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
                    <button className="absolute left-0 font-semibold text-black bg-neutral-200 px-3 py-1 rounded-xl hover:bg-neutral-400 transition duration-100 active:bg-neutral-200">Start Scan</button>
                    <button className="font-semibold text-black bg-neutral-200 px-3 py-1 rounded-xl  hover:bg-neutral-400 transition duration-100 active:bg-neutral-200">Dispatch</button>
                    <button className="font-semibold text-black bg-neutral-200 px-3 py-1 rounded-xl  hover:bg-neutral-400 transition duration-100 active:bg-neutral-200">Recall</button>
                    <button className="absolute text-black right-0 font-semibold bg-red-400 px-3 py-1 rounded-xl hover:bg-red-500 transition duration-100 active:bg-red-400">End Scan</button>
                </div>
            </section>
        </main>
    );
}