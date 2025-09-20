import { createContext, useState, useRef, type ReactNode } from 'react';
import { Vector3, Quaternion } from "three";

type WsContextType = {
    voxelSize: number;
    voxels: Vector3[],
    drones: DroneData[],
    status: boolean,
    openWs: (unityID: string, scanName: string) => string;
    startScan: () => void,
    dispatch: () => void,
    recall: () => void,
    endScan: () => void
}

type DroneData = {
    name: string;
    pos: Vector3;
    scale: Vector3;
    orientation: Quaternion;
}

export const WsContext = createContext<WsContextType | null>(null);

export function WsProvider({ children }: { children: ReactNode }) {
    const wsRef = useRef<WebSocket | null>(null);

    const [voxelSize, setVoxelSize] = useState(1);
    const [voxels, setVoxels] = useState([]);
    const [drones, setDrones] = useState([]);
    const [status, setStatus] = useState(false);

    const openWs = (unityCode: string, scanName: string) => {
        console.log("Beep beep attemping to start scan:");
        if (wsRef.current) return "Already Connected";
        const ws = new WebSocket(`wss://localhost:8080/ws/browser?unityID=${unityCode}&scanName=${scanName}`);
        wsRef.current = ws;
        setStatus(true);
        
        ws.onmessage = (event) => {
            console.log("msg:\n", JSON.parse(event.data));
        };

        ws.onclose = (event) => {
            wsRef.current = null;
            console.log("socket closed: " + event.reason);
            setStatus(false);
        };

        return " ";
    }

    const startScan = () => console.log("start scan");
    const dispatch = () => console.log("dispatch");
    const recall = () => console.log("recall");
    const endScan = () => console.log("end scan");

    return (
        <WsContext.Provider value={{ voxelSize, voxels, drones, status, openWs, startScan, dispatch, recall, endScan }}>
            {children}
        </WsContext.Provider>
    )
    
}