import app from './app.js';
import http from 'http';
import sessionMiddleware from './middleware/session.js';

import { wssBrowser, upgradeBrowser } from './ws/browser.js';
import { wssUnity, upgradeUnity } from './ws/unity.js';

const server = http.createServer(app);

const wrap = (middleware) => (req, res) =>
    new Promise((resolve, reject) => {
        middleware(req, res, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });


server.on("upgrade", async (req, socket, head) => {
    const res = new http.ServerResponse(req);
    res.writeHead = () => {};
    await wrap(sessionMiddleware)(req, res);

    if(req.url === "/ws/browser") upgradeBrowser(wssBrowser)(req, socket, head);
    else if(req.url === "/ws/unity") upgradeUnity(wssUnity)(req, socket, head);
    else socket.destroy();
});

server.listen(80, () => console.log("Container listening on port 80!!!"));