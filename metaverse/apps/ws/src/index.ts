import { WebSocketServer } from "ws";
import { User } from "./user";

const ws = new WebSocketServer({ port: 3001 });

console.log("WebSocket server started on port 3001");

ws.on("connection" , function connection(ws) {
    console.log("New client connection");
    let user = new User(ws);
    ws.on("error" , console.error);
    ws.on("close" , () => {
        user?.destroy();
    });
    
});