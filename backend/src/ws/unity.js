import { WebSocketServer } from "ws";

const wssUnity = new WebSocketServer({ noServer: true });
let unitySockets = {};

function upgradeUnity(wss) {
    return (req, socket, head) => {
        wss.handleUpgrade(req, socket, head, (ws) => {
            ws.sessionID = generateUnitySessionId();
            wss.emit("connection", ws, req);
        });
    };
}

wssUnity.on("connection", (ws, req) => {
    ws.send("Hi Unity!!");
});

function generateUnitySessionId(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let id = '';
        for (let i = 0; i < length; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    return id;
}

export { wssUnity, unitySockets, upgradeUnity };