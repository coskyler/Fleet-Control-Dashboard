import app from './app.js';
import http from 'http';
import https from 'https';
import fs from 'fs';
import { sessionMiddleware } from './middleware/session.js';

import { wssBrowser, upgradeBrowser } from './ws/browser.js';
import { wssUnity, upgradeUnity } from './ws/unity.js';

const key  = fs.readFileSync('src/certs/localhost-key.pem');
const cert = fs.readFileSync('src/certs/localhost.pem');

const server = https.createServer({ key, cert }, app);

server.on("upgrade", async (req, socket, head) => {
    if(req.url.startsWith("/ws/browser")) {
        
        sessionMiddleware(req, {}, () => {
            console.log("AHHH: " + req.session.isNew);
            if(!req.session || req.session.isNew) {
                socket.destroy();
                console.log("No session with browser upgrade request");
                socket.destroy();
                return;
            } else {
                console.log(req.session);
                upgradeBrowser(wssBrowser)(req, socket, head);
            }
        });
    }
    else if(req.url === "/ws/unity") upgradeUnity(wssUnity)(req, socket, head);
    else socket.destroy();
});

server.listen(80, () => console.log("Container listening on port 80!!!"));