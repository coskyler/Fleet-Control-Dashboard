import { createContext, useContext, useState, useRef, type ReactNode, type RefObject, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { Vector3, Quaternion } from "three";
const apiDomain = import.meta.env.VITE_API_DOMAIN;
const wssDomain = import.meta.env.VITE_WSS_DOMAIN;

type WsContextType = {
    scanName: RefObject<string>,
    voxelSize: RefObject<number>,
    voxels: RefObject<Vector3[]>,
    drones: RefObject<Map<string, DroneData>>,
    status: RefObject<Status>,
    tick: number,
    scanOwner: RefObject<string>,
    openWs: (unityID: string, scanName: string) => Promise<string>;
    startScan: () => void,
    dispatch: () => void,
    recall: () => void,
    endScan: () => void,
    setTick: React.Dispatch<React.SetStateAction<number>>;
}

type Status = 'uninitialized' | 'connecting' | 'live' | 'live_scanning' | 'disconnected' | 'completed';

type DroneData = {
    name: string,
    pos: Vector3,
    scale: Vector3,
    orientation: Quaternion
}

type IncomingDroneData = {
  name: string;
  pos: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  orientation: { x: number; y: number; z: number; w: number };
};

type IncomingVoxelData = { x: number, y: number, z: number };


export const WsContext = createContext<WsContextType | null>(null);

export function WsProvider({ children }: { children: ReactNode }) {
    const authCtx = useContext(AuthContext);

    const wsRef = useRef<WebSocket | null>(null);

    const voxelSize = useRef(1);
    const voxels = useRef<Vector3[]>([]);
    const drones = useRef<Map<string, DroneData>>(new Map());
    const status = useRef<Status>('uninitialized');
    const scanName = useRef('');
    const scanOwner = useRef('');

    const [tick, setTick] = useState(0);

    function round2(val: any) {
        return Number.parseFloat(Number(val).toFixed(2));
    }

    useEffect(() => {
        if(authCtx?.authed === false) {
            wsRef.current = null;
        }
    }, [authCtx?.authed]);

    const openWs = async (unityCode: string, newScanName: string) => {
        console.log("Beep beep attemping to start scan:");
        if (wsRef.current) {
            console.log("Already connected to ws. Coconut");
            return "Already connected";
        }

        const ws = new WebSocket(`${wssDomain}/ws/browser?unityID=${unityCode}&scanName=${newScanName}`);
        wsRef.current = ws;

        voxels.current = [];
        drones.current = new Map();

        status.current = 'connecting';
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("msg:\n", data);

            if(status.current !== 'live_scanning') status.current = 'live';

            if(!('drones' in data) && !('voxels' in data)) return;

            if('name' in data) {
                scanName.current = data.name;
                voxelSize.current = data.voxelSize;
                scanOwner.current = data.owner;

                data.drones.forEach((droneName: string) => {
                    const newDroneData: DroneData = {
                        name: droneName,
                        pos: new Vector3(0, 0, 0),
                        scale: new Vector3(0, 0, 0),
                        orientation: new Quaternion(0, 0, 0, 0)
                    }
                    
                    drones.current.set(droneName, newDroneData)
                });
            } else {
                if(('drones' in data)) {
                    data.drones.forEach((droneInfo: IncomingDroneData) => {

                        const convertedPos = new Vector3(round2(droneInfo.pos.x), round2(droneInfo.pos.y), -round2(droneInfo.pos.z));

                        const convertedScale = new Vector3(round2(droneInfo.scale.x), round2(droneInfo.scale.y), round2(droneInfo.scale.z));

                        const convertedOrientation = new Quaternion(-round2(droneInfo.orientation.x), round2(droneInfo.orientation.y), -round2(droneInfo.orientation.z), round2(droneInfo.orientation.w));

                        const newDroneData: DroneData = {
                            name: droneInfo.name,
                            pos: convertedPos,
                            scale: convertedScale,
                            orientation: convertedOrientation
                        }

                        drones.current.set(droneInfo.name, newDroneData)
                    });
                };

                data.voxels.forEach((voxelInfo: IncomingVoxelData) => {
                    const convertedPos = new Vector3(round2(voxelInfo.x) * voxelSize.current, round2(voxelInfo.y) * voxelSize.current, round2(-voxelInfo.z) * voxelSize.current);

                    voxels.current.push(convertedPos);
                });
            }

            console.log("we should we rendering here...");
            setTick(prev => prev + 1);
        };

        ws.onclose = (event) => {
            wsRef.current = null;
            console.log("socket closed: " + event.reason);
            if(event.reason === 'Unity scan ended') {
                status.current = 'completed';
            } else {
                status.current = 'disconnected';
            }

            setTick(prev => prev + 1);
        };

        ws.onerror = (err) => {
            status.current = 'disconnected';
            console.log("Ws err:\n", err);
            setTick(prev => prev + 1);
        }

        return "Connecting";
    }

    const startScan = () => {
        wsRef.current?.send(JSON.stringify({ message: 'start' }));
        status.current = 'live_scanning';
        setTick((prev) => prev + 1);
    };

    const dispatch = () => {
        wsRef.current?.send(JSON.stringify({ message: 'dispatch' }));
    };

    const recall = () => {
        wsRef.current?.send(JSON.stringify({ message: 'recall' }));
    };

    const endScan = () => {
        wsRef.current?.send(JSON.stringify({ message: 'close' }));
    };

    return (
        <WsContext.Provider value={{ scanName, voxelSize, voxels, drones, status, tick, scanOwner, openWs, startScan, dispatch, recall, endScan, setTick }}>
            {children}
        </WsContext.Provider>
    )
    
}