import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import WhatsAppController, { initializeClient } from '../Controller/Whatsapp/WhatsappController';
const WhatsappRouter = Router();
WhatsappRouter.post('/send-message', async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { candidate_id, message } = req.body;
        const whatsAppController = new WhatsAppController(session);
        const result = await whatsAppController.sendMessage(candidate_id, message);
        await session.commitTransaction();
        res.json(result);
        return
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ error });
    } finally {
        session.endSession();
    }
})
WhatsappRouter.get('/initialize', async (req: Request, res: Response) => {
    try {
        initializeClient('1');
        res.json({ success: "Client Initialized" });
        return;
    } catch (error) {
        res.status(500).json({ error });
        return;
    }
})
export default WhatsappRouter;