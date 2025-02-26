import { WebSocketServer } from "ws";
import {User} from "./user"

const ws = new WebSocketServer({port : 3001});

ws.on("connection" , function connection(ws) {
    let user: User | undefined;
    ws.on("error" , console.error);

    ws.on("message" , function connection(data) {
        user = new User(ws);
    });

    ws.on("close" , () => {
        user?.destroy();
    });
    
});