"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wss = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ws_1 = require("ws");
const LinkedinRouter_1 = __importDefault(require("./Router/LinkedinRouter"));
const WhatsappController_1 = require("./Controller/Whatsapp/WhatsappController");
const WhatsappRouter_1 = __importDefault(require("./Router/WhatsappRouter"));
const app = (0, express_1.default)();
exports.app = app;
const wss = new ws_1.WebSocketServer({ noServer: true });
exports.wss = wss;
wss.on('connection', (ws) => {
    const clientId = '1';
    (0, WhatsappController_1.initializeClient)(clientId);
    setTimeout(() => {
        console.log("Init client");
        console.log(`WebSocket connection established for client ${clientId}`);
        WhatsappController_1.clients[clientId].client.on('message', async (msg) => {
            ws.send(JSON.stringify({ from: msg.from, body: msg.body }));
        });
        WhatsappController_1.clients[clientId].client.on('qr', (qr) => {
            ws.send(JSON.stringify({ body: qr }));
        });
        WhatsappController_1.clients[clientId].client.on('ready', (qr) => {
            ws.send(JSON.stringify({ body: 'Client Is Ready' }));
        });
    }, 2000);
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Hello World");
});
app.use("/linkedin", LinkedinRouter_1.default);
app.use('/whats-app', WhatsappRouter_1.default);
