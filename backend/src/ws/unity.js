import { WebSocketServer } from "ws";
import redisClient from "../infra/redis.js";

const wssUnity = new WebSocketServer({ noServer: true });
let unitySockets = {};

function upgradeUnity(wss) {
    return (req, socket, head) => {
        wss.handleUpgrade(req, socket, head, async (ws) => {
            ws.sessionID = generateUnitySessionId();
            while(ws.sessionID in unitySockets || await redisClient.exists(ws.sessionID)) ws.sessionID = generateUnitySessionId();
            unitySockets[ws.sessionID] = ws;

            wss.emit("connection", ws, req);
        });
    };
}

wssUnity.on("connection", (ws, req) => {
    ws.send("Hi Unity!! Your session ID is: " + ws.sessionID);

    ws.on('message', async (msg) => {
        let data;
        try {
            data = JSON.parse(msg.toString()); 
        } catch(err)  {
            console.error("Invalid JSON from Unity websocket message: " + err);
        }

        await redisClient.xAdd(ws.sessionID, { payload: JSON.stringify(data) });
    })

    ws.on('close', () => {
        delete unitySockets[ws.sessionID];
    });
});

function closeUnityWs(sessionID) {
    let ws = unitySockets[sessionID];

    if(ws) ws.close();
}

function sendUnityWs(sessionID, msg) {
    let ws = unitySockets[sessionID];
    if(!ws || ws.readyState !== ws.OPEN) return;

    ws.send(msg);
}

function generateUnitySessionId(length = 4) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let id = '';
        for (let i = 0; i < length; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    return id;
}

export { wssUnity, sendUnityWs, closeUnityWs, upgradeUnity };