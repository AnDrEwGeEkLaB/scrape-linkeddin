import express, { Application } from "express";
import cors from "cors";
import WebSocket, { WebSocketServer } from 'ws';

import LinkedinRouter from "./Router/LinkedinRouter";
import { clients, initializeClient } from "./Controller/Whatsapp/WhatsappController";
import WhatsappRouter from "./Router/WhatsappRouter";

const app: Application = express();

const wss = new WebSocketServer({ noServer: true });
wss.on('connection', (ws: WebSocket) => {
    const clientId = '1';
    initializeClient(clientId);
    setTimeout(() => {
        console.log("Init client")
        console.log(`WebSocket connection established for client ${clientId}`);
        clients[clientId].client.on('message', async (msg: { from: string; body: string }) => {
            ws.send(JSON.stringify({ from: msg.from, body: msg.body }));
        });
        clients[clientId].client.on('qr', (qr: string) => {
            ws.send(JSON.stringify({ body: qr }));
        });
        clients[clientId].client.on('ready', (qr: string) => {
            ws.send(JSON.stringify({ body: 'Client Is Ready' }));
        })
    }, 2000);
})

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use("/linkedin", LinkedinRouter);
app.use('/whats-app', WhatsappRouter)


export { app, wss };
