import { createContext, useState, useRef, type ReactNode, type RefObject } from 'react';
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
    openWs: (unityID: string, scanName: string) => Promise<string>;
    startScan: () => void,
    dispatch: () => void,
    recall: () => void,
    endScan: () => void
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
    const wsRef = useRef<WebSocket | null>(null);

    const voxelSize = useRef(1);
    const voxels = useRef<Vector3[]>([]);
    const drones = useRef<Map<string, DroneData>>(new Map());
    const status = useRef<Status>('uninitialized');
    const scanName = useRef('');

    const [tick, setTick] = useState(0);

    const openWs = async (unityCode: string, newScanName: string) => {
        console.log("Beep beep attemping to start scan:");
        if (wsRef.current) {
            console.log("Already connected to ws. Coconut");
            return "Already connected";
        }

        const ws = new WebSocket(`${wssDomain}/ws/browser?unityID=${unityCode}&scanName=${newScanName}`);
        wsRef.current = ws;

        status.current = 'connecting';
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("msg:\n", data);

            if(!('drones' in data)) return;

            if(status.current !== 'live_scanning') status.current = 'live';

            if('name' in data) {
                scanName.current = data.name;
                voxelSize.current = data.voxelSize;

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
                data.drones.forEach((droneInfo: IncomingDroneData) => {
                    const convertedPos = new Vector3(droneInfo.pos.x, droneInfo.pos.y, droneInfo.pos.z);
                    const convertedScale = new Vector3(droneInfo.scale.x, droneInfo.scale.y, droneInfo.scale.z);
                    const convertedOrientation = new Quaternion(droneInfo.orientation.x, droneInfo.orientation.y, droneInfo.orientation.z, droneInfo.orientation.w);

                    const newDroneData: DroneData = {
                        name: droneInfo.name,
                        pos: convertedPos,
                        scale: convertedScale,
                        orientation: convertedOrientation
                    }

                    drones.current.set(droneInfo.name, newDroneData)
                });

                data.voxels.forEach((voxelInfo: IncomingVoxelData) => {
                    const convertedPos = new Vector3(voxelInfo.x, voxelInfo.y, voxelInfo.z);

                    voxels.current.push(convertedPos);
                });
            }

            console.log("we should we rendering here...");
            setTick(prev => prev + 1);
        };

        ws.onclose = (event) => {
            wsRef.current = null;
            console.log("socket closed: " + event.reason);
            if(event.reason === 'scan completed') {
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
        wsRef.current?.send('start');
        status.current = 'live_scanning';
    };

    const dispatch = () => {
        wsRef.current?.send('dispatch');
    };

    const recall = () => {
        wsRef.current?.send('recall');
    };

    const endScan = () => {
        wsRef.current?.send('close');
    };

    return (
        <WsContext.Provider value={{ scanName, voxelSize, voxels, drones, status, tick, openWs, startScan, dispatch, recall, endScan }}>
            {children}
        </WsContext.Provider>
    )
    
}