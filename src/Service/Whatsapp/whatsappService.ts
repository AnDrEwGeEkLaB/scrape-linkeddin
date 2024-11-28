import { Client } from 'whatsapp-web.js';
import * as fs from 'fs';
class WhatsAppClient {
    client: Client;
    clientId: string;
    constructor(clientId: string) {
        if (!clientId) {
            throw new Error('clientId must be provided');
        }
        if (clientId === undefined || clientId === "undefined")
            throw new Error('clientId must be provided');
        this.clientId = clientId;
        this.client = new Client({
            puppeteer: {
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            }
        });
        this.client.on('qr', (qr: string) => {
           console.log(`QR for ${clientId}:`, qr);
        });
        this.client.on('ready', () => {
            console.log(`Client ${clientId} is ready!`);
        });
        this.client.on('auth_failure', (msg: any) => {
            console.error(`Authentication failure for client ${clientId}: ${msg}`);
        });
        this.client.on('disconnected', (reason: any) => {
            console.log(`Client ${clientId} disconnected: ${reason}`);
            this.cleanup();
        });
        this.client.initialize().catch((err: any) => {
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
        } catch (error) {
            console.error(`Failed to remove session files for client ${this.clientId}:`, error);
        }
    }


    async sendMessage(to: string, message: string) {
        try {
            const chat = await this.client.getChatById(to);
            await chat.sendMessage(message);
            return "Message sent successfully";
        } catch (error) {
            console.error(`Failed to send message to ${to} for client ${this.clientId}:`, error);
            throw "Failed to send message";
        }
    }
}
export default WhatsAppClient;