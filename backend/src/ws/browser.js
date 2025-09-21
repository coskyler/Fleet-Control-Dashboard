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
            //assign redis session to ws
            let sessionID;
            parse(req, new http.ServerResponse(req), () => {
                sessionID = req.signedCookies?.["connect.sid"];
            })

            let sessionStr;
            const sessionKey = `sess:${sessionID}`;
            if(sessionID) {
                sessionStr = await redisClient.get(sessionKey);
                if(sessionStr) {
                    req.session = JSON.parse(sessionStr);
                    ws.sessionID = sessionID;
                } else {
                    ws.close(1000, "Outdated or invalid session");
                    return;
                }
            } else {
                ws.close(1000, "No session cookie exists");
                return;
            }

            //assign unityID to ws
            const params = new URL(req.url, "http://localhost").searchParams;
            const unityID = params.get("unityID");
            const scanName =  params.get("scanName");

            if(req.session.unityID && req.session.unityID !== unityID) {
                ws.close(1000, "You already have a scan going");
                return;
            }

            const scanInfoStr = await redisClient.get('info:' + unityID);
            const scanInfo = scanInfoStr ? JSON.parse(scanInfoStr) : null;

            if(!scanInfo) {
                const sentUnityID = req.session.unityID;
                if(sentUnityID !== undefined) {
                    delete req.session.unityID;
                    await redisClient.setEx(sessionKey, Number(process.env.SESSION_TTL) / 1000, JSON.stringify(req.session));
                }

                ws.close(1000, "Invalid Unity ID");
                return;
            }

            ws.unityID = unityID;

            //assign scan ownership
            if(scanInfo.owner === null) {
                scanInfo.owner = sessionID;
                scanInfo.name = scanName;
                await redisClient.set('info:' + unityID, JSON.stringify(scanInfo));
                ws.owner = true;
            } else if(scanInfo.owner === sessionID) {
                ws.owner = true;
            } else {
                ws.owner = false;
            }

            //assign unityID to session
            if(ws.owner) {
                if(!('unityID' in req.session) || req.session.unityID !== unityID) {
                    req.session.unityID = unityID;
                    await redisClient.setEx(sessionKey, Number(process.env.SESSION_TTL) / 1000, JSON.stringify(req.session));
                }
            }

            //say hi :D
            ws.send(JSON.stringify({"Greeting: ": "Hi " + sessionID + "!"}));

            //send scan info and map history
            ws.send(JSON.stringify(scanInfo));

            const entries = await redisClient.xRange(ws.unityID, "-", "+");

            if(entries.length > 0) {
                let map = {}
                let voxels = [];

                for(let i = 0; i < entries.length; i++) {
                    let msg = JSON.parse(entries[i].message.payload);
                    voxels.push(...msg.voxels);
                }

                map.voxels = voxels;
                map.drones = JSON.parse(entries[entries.length - 1].message.payload).drones;

                ws.send(JSON.stringify(map));
            }

            //start sending current info
            wss.emit("connection", ws, req);
        });
    };
}

wssBrowser.on("connection", (ws, req) => {

});

export { wssBrowser, browserSockets, upgradeBrowser };