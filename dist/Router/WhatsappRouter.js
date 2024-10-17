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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const WhatsappController_1 = __importStar(require("../Controller/Whatsapp/WhatsappController"));
const WhatsappRouter = (0, express_1.Router)();
WhatsappRouter.post('/send-message', async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { candidate_id, message } = req.body;
        const whatsAppController = new WhatsappController_1.default(session);
        const result = await whatsAppController.sendMessage(candidate_id, message);
        await session.commitTransaction();
        res.json(result);
        return;
    }
    catch (error) {
        await session.abortTransaction();
        res.status(500).json({ error });
    }
    finally {
        session.endSession();
    }
});
WhatsappRouter.get('/initialize', async (req, res) => {
    try {
        (0, WhatsappController_1.initializeClient)('1');
        res.json({ success: "Client Initialized" });
        return;
    }
    catch (error) {
        res.status(500).json({ error });
        return;
    }
});
exports.default = WhatsappRouter;
