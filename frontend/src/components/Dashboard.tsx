import ScanRenderer from './ScanRenderer';
import { WsContext } from '../contexts/ScanWsContext';
import { AuthContext } from '../contexts/AuthContext';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DroneRow from './DroneRow';
import { Vector3 } from 'three';
const apiDomain = import.meta.env.VITE_API_DOMAIN;

export default function Dashboard() {
    const wsCtx = useContext(WsContext);
    const authCtx = useContext(AuthContext);

    const navigate = useNavigate();

    const [rows, setRows] = useState<any[]>([]);
    
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

    useEffect(() => {
        if(!wsCtx?.drones.current) return;

        const tempRows = [...rows];
        
        if(rows.length === 0) {
            for(const [k, v] of wsCtx?.drones.current) {
                    tempRows.push({ name: v.name, pos: v.pos });

            }
        }
        else {
            for(const [k, v] of wsCtx?.drones.current) {
                for(const row of tempRows) {
                    if(row.name === v.name) {
                        row.pos = v.pos;
                    }
                }

            }
        }

        setRows(tempRows);
    }, [wsCtx?.tick]);

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
        wsCtx?.endScan();
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

    console.log('\n', wsCtx?.voxels.current);

    return  (
        <main className="h-full flex flex-col bg-neutral-800 p-6 text-white">
            <h1 className="text-3xl mb-4">{wsCtx?.scanName.current ? wsCtx?.scanName.current : "Untitled Scan"}</h1>
            
            <section className="flex-1 flex min-h-0">
                <div className="h-full flex flex-col min-h-0">
                    <aside className="flex flex-col flex-1 min-h-0">
                        <span className="block text-[20px] mb-2 font-semibold">Fleet</span>
                        <div className="w-64 bg-neutral-700 rounded-xl mr-2 p-1 flex flex-col gap-1 overflow-y-auto flex-1 min-h-0 my-scrollbar">
                            {rows.map((row, i) => (
                                <DroneRow key={i} droneName={row.name} dronePos={row.pos}></DroneRow>
                            ))}
                        </div>
                    </aside>
                </div>
            
                <div className="flex-1 bg-neutral-700 rounded-xl min-h-0">
                    <ScanRenderer voxelsRef={wsCtx?.voxels} dronesRef={wsCtx?.drones} voxelSize={wsCtx?.voxelSize.current}/>
                </div>
            </section>

            <section className="flex mt-2">
                <div className="w-64 mr-2"></div>
                
                <div className={`relative flex-1 justify-center gap-4 ${wsCtx?.scanOwner.current === 'not you!' ? 'hidden' : 'flex'}`}>
                    <button onClick={() => {wsCtx?.startScan()}} className={`cursor-pointer font-semibold text-black bg-neutral-200 px-3 py-1 rounded-xl  hover:bg-neutral-400 transition duration-100 active:bg-neutral-200 ${wsCtx?.status.current === 'live' ? 'flex' : 'hidden'}`}>Start Scan</button>
                    <button onClick={() => {wsCtx?.dispatch()}} className={`cursor-pointer font-semibold text-black bg-neutral-200 px-3 py-1 rounded-xl  hover:bg-neutral-400 transition duration-100 active:bg-neutral-200 ${wsCtx?.status.current === 'live_scanning' ? 'flex' : 'hidden'}`}>Dispatch</button>
                    <button onClick={() => {wsCtx?.recall()}} className={`cursor-pointer font-semibold text-black bg-neutral-200 px-3 py-1 rounded-xl  hover:bg-neutral-400 transition duration-100 active:bg-neutral-200 ${wsCtx?.status.current === 'live_scanning' ? 'flex' : 'hidden'}`}>Recall</button>
                    <button onClick={() => {saveScan()}} className={`cursor-pointer font-semibold text-black bg-neutral-200 px-3 py-1 rounded-xl  hover:bg-neutral-400 transition duration-100 active:bg-neutral-200 ${wsCtx?.status.current === 'completed' ? 'flex' : 'hidden'}`}>Save Scan</button>
                    <button onClick={() => {discardScan()}} className={`cursor-pointer font-semibold text-black bg-red-400 px-3 py-1 rounded-xl  hover:bg-red-500 transition duration-100 active:bg-red-400 ${(wsCtx?.status.current === 'completed' || wsCtx?.status.current === 'live') ? 'flex' : 'hidden'}`}>Discard Scan</button>
                    <button onClick={() => {wsCtx?.endScan()}} className={`cursor-pointer absolute text-black right-0 font-semibold bg-neutral-200 px-3 py-1 rounded-xl hover:bg-neutral-400 transition duration-100 active:bg-neutral-200 ${wsCtx?.status.current === 'live_scanning' ? 'flex' : 'hidden'}`}>End Scan</button>
                </div>
                
                <div className={`italic flex-1 justify-center ${wsCtx?.scanOwner.current === 'not you!' ? 'flex' : 'hidden'}`}>
                        <span className={`text-[22px] mb-2`}>You are spectating</span>
                </div>
                
            </section>
        </main>
    );

}