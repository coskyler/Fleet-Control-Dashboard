import { WebSocketServer } from "ws";

const wssBrowser = new WebSocketServer({ noServer: true });

wssBrowser.on("connection", (ws, req) => {
    ws.send("Hi browser!!");
});

export default wssBrowser;