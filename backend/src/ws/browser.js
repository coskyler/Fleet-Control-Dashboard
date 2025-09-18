import { WebSocketServer } from "ws";
import redisClient from '../infra/redis.js'

const wssBrowser = new WebSocketServer({ noServer: true });
let browserSockets = {};

function upgradeBrowser(wss) {
    return (req, socket, head) => {
        wss.handleUpgrade(req, socket, head, async (ws) => {
            ws.reqSessionID = req.sessionID;
            ws.reqSession = req.session;

            const params = new URL(req.url, "http://localhost").searchParams;
            const unityID = params.get("unityID");
            ws.sessionID = unityID;

            if(!(await redisClient.exists(ws.sessionID))) {
                ws.send("Invalid Unity ID");
                ws.close();
                return;
            }

            const entries = await redisClient.xRange(ws.sessionID, "-", "+");

            ws.send("Hi browser!");
            ws.send(entries[0].message.payload);

            let map = {}
            let voxels = [];

            for(let i = 1; i < entries.length; i++) {
                let msg = JSON.parse(entries[i].message.payload);
                voxels.push(...msg.voxels);
            }

            map.voxels = voxels;
            map.drones = JSON.parse(entries[entries.length - 1].message.payload).drones;

            ws.send(JSON.stringify(map));

            wss.emit("connection", ws, req);
        });
    };
}

wssBrowser.on("connection", (ws, req) => {

});

export { wssBrowser, browserSockets, upgradeBrowser };