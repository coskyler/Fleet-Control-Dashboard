import app from './app.js';
import http from 'http';

import wssBrowser from './ws/browser.js';
import wssUnity from './ws/unity.js';

const server = http.createServer(app);

server.on("upgrade", (req, socket, head) => {

});

server.listen(80, () => console.log("Container listening on port 80!!!"));