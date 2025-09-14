import { WebSocketServer } from "ws";

const wssUnity = new WebSocketServer({ noServer: true });

wssUnity.on("connection", (ws, req) => {
    ws.send("Hi Unity!!");
});

export default wssUnity;