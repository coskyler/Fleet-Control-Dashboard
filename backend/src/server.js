import app from './app.js';
import http from 'http';
import https from 'https';
import fs from 'fs';
import cookieParser from 'cookie-parser';

import { wssBrowser, upgradeBrowser } from './ws/browser.js';
import { wssUnity, upgradeUnity } from './ws/unity.js';
import redisClient from './infra/redis.js';

const key  = fs.readFileSync('src/certs/localhost-key.pem');
const cert = fs.readFileSync('src/certs/localhost.pem');

const server = https.createServer({ key, cert }, app);

const parse = cookieParser(process.env.SESSION_SIGNATURE);

server.on("upgrade", async (req, socket, head) => {
    if(req.url.startsWith("/ws/browser")) upgradeBrowser(wssBrowser)(req, socket, head);
    else if(req.url === "/ws/unity") upgradeUnity(wssUnity)(req, socket, head);
    else socket.destroy();
});

server.listen(80, () => console.log("Container listening on port 80!!!"));