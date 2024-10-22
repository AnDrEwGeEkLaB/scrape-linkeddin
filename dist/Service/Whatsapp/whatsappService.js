"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const whatsapp_web_js_1 = require("whatsapp-web.js");
const fs = __importStar(require("fs"));
class WhatsAppClient {
    constructor(clientId) {
        if (!clientId) {
            throw new Error('clientId must be provided');
        }
        if (clientId === undefined || clientId === "undefined")
            throw new Error('clientId must be provided');
        this.clientId = clientId;
        this.client = new whatsapp_web_js_1.Client({
            puppeteer: {
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            }
        });
        this.client.on('qr', (qr) => {
            console.log(`QR for ${clientId}:`, qr);
        });
        this.client.on('ready', () => {
            console.log(`Client ${clientId} is ready!`);
        });
        this.client.on('auth_failure', (msg) => {
            console.error(`Authentication failure for client ${clientId}: ${msg}`);
        });
        this.client.on('disconnected', (reason) => {
            console.log(`Client ${clientId} disconnected: ${reason}`);
            this.cleanup();
        });
        this.client.initialize().catch((err) => {
            console.error(`Failed to initialize client ${clientId}:`, err);
        });
    }
    async cleanup() {
        try {
            // Remove session files on disconnect
            if (fs.existsSync('.wwebjs_cache')) {
                fs.rmSync('.wwebjs_cache', { recursive: true, force: true });
                console.log(`Session files for client ${this.clientId} removed.`);
            }
        }
        catch (error) {
            console.error(`Failed to remove session files for client ${this.clientId}:`, error);
        }
    }
    async sendMessage(to, message) {
        try {
            const chat = await this.client.getChatById(to);
            await chat.sendMessage(message);
            return "Message sent successfully";
        }
        catch (error) {
            console.error(`Failed to send message to ${to} for client ${this.clientId}:`, error);
            throw "Failed to send message";
        }
    }
}
exports.default = WhatsAppClient;
