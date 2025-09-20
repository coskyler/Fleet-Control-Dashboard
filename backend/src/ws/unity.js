import { WebSocketServer } from "ws";
import redisClient from "../infra/redis.js";

const wssUnity = new WebSocketServer({ noServer: true });
let unitySockets = {};

function upgradeUnity(wss) {
    return (req, socket, head) => {
        wss.handleUpgrade(req, socket, head, async (ws) => {
            ws.unityID = generateUnityID();
            while(ws.unityID in unitySockets || await redisClient.exists(ws.unityID)) ws.unityID = generateUnityID();

            const params = new URL(req.url, "http://localhost").searchParams;

            const scanInfo = {
                "voxelSize": params.get("voxelSize"),
                "startTime": params.get("startTime"),
                "drones": params.getAll("drone"),
                "name": null,
                "owner": null
            };

            await redisClient.set('info:' + ws.unityID, JSON.stringify(scanInfo));

            unitySockets[ws.unityID] = ws;

            wss.emit("connection", ws, req);
        });
    };
}

wssUnity.on("connection", (ws, req) => {
    ws.send("Hi Unity!! Your session ID is: " + ws.unityID);

    ws.on('message', async (msg) => {
        let data;
        try {
            data = JSON.parse(msg.toString()); 
        } catch(err)  {
            console.error("Invalid JSON from Unity websocket message: " + err);
        }

        await redisClient.xAdd(ws.unityID, '*', { payload: JSON.stringify(data) });
    })

    ws.on('close', () => {
        delete unitySockets[ws.unityID];
    });
});

function closeUnityWs(unityID) {
    let ws = unitySockets[unityID];

    if(ws) ws.close();
}

function sendUnityWs(unityID, msg) {
    let ws = unitySockets[unityID];
    if(!ws || ws.readyState !== ws.OPEN) return;

    ws.send(msg);
}

function generateUnityID(length = 5) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let id = '';
        for (let i = 0; i < length; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    return id;
}

export { wssUnity, sendUnityWs, closeUnityWs, upgradeUnity };