import { WebSocketServer } from "ws";

const wssBrowser = new WebSocketServer({ noServer: true });
let browserSockets = {};

function upgradeBrowser(wss) {
    return (req, socket, head) => {
        wss.handleUpgrade(req, socket, head, (ws) => {
            ws.sessionID = req.sessionID;
            wss.emit("connection", ws, req);
        });
    };
}

wssBrowser.on("connection", (ws, req) => {
    ws.send("Hi browser!!");
});

export { wssBrowser, browserSockets, upgradeBrowser };