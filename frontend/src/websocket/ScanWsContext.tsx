import { createContext, useState, useRef, type ReactNode } from 'react';
import { Vector3, Quaternion } from "three";

type WsContextType = {
    voxelSize: number;
    voxels: Vector3[],
    drones: DroneData[],
    status: boolean,
    openWs: (unityID: string) => string;
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

const WsContext = createContext<WsContextType | null>(null);

export function WsProvider({ children }: { children: ReactNode }) {
    const wsRef = useRef<WebSocket | null>(null);

    const [voxelSize, setVoxelSize] = useState(1);
    const [voxels, setVoxels] = useState([]);
    const [drones, setDrones] = useState([]);
    const [status, setStatus] = useState(false);

    const openWs = (unityCode: string) => {
        console.log("Beep beep attemping to start scan:");
        if (wsRef.current) return "Already Connected";
        const ws = new WebSocket('ws://localhost:8080');
        wsRef.current = ws;
        setStatus(true);
        
        ws.onmessage = (event) => {
            console.log("yoo it works " + event.data);
        };

        ws.onclose = () => {
            wsRef.current = null;
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