import { WebSocketServer } from "ws";
import redisClient from '../infra/redis.js'
import http from 'http';
import cookieParser from 'cookie-parser';

const wssBrowser = new WebSocketServer({ noServer: true });
let browserSockets = {};

const parse = cookieParser(process.env.SESSION_SIGNATURE);

function upgradeBrowser(wss) {
    return (req, socket, head) => {
        wss.handleUpgrade(req, socket, head, async (ws) => {
            //assign redis session to req
            let sid;
            parse(req, new http.ServerResponse(req), () => {
                sid = req.signedCookies?.["connect.sid"];
            })

            if(sid) {
                const key = `sess:${sid}`;
                const session = await redisClient.get(key);
                if(session) {
                    req.session = JSON.parse(session);
                } else {
                    ws.close(1000, "Outdated or invalid session");
                    return;
                }
            } else {
                ws.close(1000, "No session cookie exists");
                return;
            }
            
            
            ws.sessionID = req.sessionID;
            ws.session = req.session;

            const params = new URL(req.url, "http://localhost").searchParams;
            const unityID = params.get("unityID");
            ws.unityID = unityID;

            if(!(await redisClient.exists(ws.unityID))) {
                ws.close(1000, "Invalid Unity ID");
                return;
            }

            const entries = await redisClient.xRange(ws.unityID, "-", "+");

            ws.send("Hi browser!");

            if(entries.length > 0) {
                ws.send(entries[0].message.payload);

                if(entries.length > 1) {
                    let map = {}
                    let voxels = [];

                    for(let i = 1; i < entries.length; i++) {
                        let msg = JSON.parse(entries[i].message.payload);
                        voxels.push(...msg.voxels);
                    }

                    map.voxels = voxels;
                    map.drones = JSON.parse(entries[entries.length - 1].message.payload).drones;

                    ws.send(JSON.stringify(map));
                }
            }

            wss.emit("connection", ws, req);
        });
    };
}

wssBrowser.on("connection", (ws, req) => {

});

export { wssBrowser, browserSockets, upgradeBrowser };