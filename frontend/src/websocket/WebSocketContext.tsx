import { createContext, useRef, useState, type ReactNode } from 'react';

type WebSocketContextType = {
    ws: WebSocket | null
    connect: () => void
    disconnect: () => void
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
    const wsRef = useRef<WebSocket | null>(null);
    
    const connect = () => {
        if (wsRef.current) return;
        const ws = new WebSocket('ws://localhost:3000');
        wsRef.current = ws;

        ws.onclose = () => {
            wsRef.current = null;
        };
    }

    const disconnect = () => {
        if(wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    }

    return (
        <WebSocketContext.Provider value={{ ws: wsRef.current, connect, disconnect }}>
            { children }
        </WebSocketContext.Provider>
    )

}