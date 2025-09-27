import { useState, useContext, useEffect } from 'react';
import { WsContext } from '../contexts/ScanWsContext';
import { useNavigate } from 'react-router-dom';

export default function Spectate() {
    const [mapName, setMapName] = useState('');
    const [unityCode, setUnityCode] = useState('');
    const [status, setStatus] = useState('Idle');
    const [errMsg, setErrMsg] = useState('');

    const wsCtx = useContext(WsContext);
    
    const navigate = useNavigate();

    const cleanUnityCode = (raw: string) => {
          return raw
            .replace(/[^a-zA-Z0-9]/g, '')   //only allow letters and numbers
            .toUpperCase()                  //force uppercase
            .slice(0, 5);                   //limit to 5 chars
    }

    const connectWebsocket = async () => {
        const connection: string | undefined = await wsCtx?.openWs(unityCode, mapName);
        if(connection !== 'Connecting') {
            console.log('connection err:\n', connection);
            return;
        }

        setStatus('Connecting');
    }

    useEffect(() => {
        if(status === 'Connecting' && wsCtx?.status.current === 'live') {
            navigate("/dashboard");
        }
        if(status === 'Connecting') setErrMsg("Invalid Fleet Code");
        setStatus('Idle');
    }, [wsCtx]);

    return(
        <main className="h-full flex flex-col justify-center items-center bg-transparent bg-neutral-800 p-6 text-white">
            <h1 className="text-3xl mb-8">Spectate Scan</h1>
            <div className="w-full max-w-150 bg-neutral-700 rounded-3xl overflow-hidden">
                <div className="flex">
                    <div className="w-1/4 bg-neutral-600 px-6 pb-3 pt-3">Fleet Code</div>
                    <input type="text"
                        placeholder="5 characters"
                        maxLength={5}
                        value={unityCode}
                        onChange={(e) => setUnityCode(cleanUnityCode(e.target.value))}
                        className ="flex-1 px-6 placeholder:text-neutral-400 outline-none"
                    />
                </div>
            </div>
            <button onClick={connectWebsocket} className={`cursor-pointer mb-6 bg-neutral-200 p-2 rounded-xl mt-6 text-black font-semibold hover:bg-neutral-400 transition duration-100 active:bg-neutral-200 ${unityCode.length === 5 ? "visible" : "invisible"}`}>Connect</button>
            <span className="text-[18px] mb-8 h-[18px]">{errMsg}</span>
        </main>
    );
}