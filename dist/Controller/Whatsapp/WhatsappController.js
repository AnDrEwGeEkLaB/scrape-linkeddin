"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clients = exports.initializeClient = void 0;
const whatsappService_1 = __importDefault(require("../../Service/Whatsapp/whatsappService"));
const CandidateService_1 = __importDefault(require("../../Service/CandidateService/CandidateService"));
const utils_1 = require("../../utils");
class WhatsAppController {
    constructor(session) {
        this.session = session;
    }
    async changeMessageStatus(_id, candidate, session) {
        const { currentStep, messageStatus, stepsStatus } = candidate;
        const currentStepIndex = utils_1.HiringSteps.indexOf(currentStep);
        if (currentStepIndex === -1) {
            throw 'CURRENT_STEP_NOT_FOUND';
        }
        if (currentStepIndex === utils_1.HiringSteps.length - 1)
            throw 'LAST_HIRING_STEP';
        messageStatus[currentStepIndex].status = utils_1.StatusEnum.APPROVED;
        stepsStatus[currentStepIndex].status = utils_1.StatusEnum.APPROVED;
        const result = await CandidateService_1.default.changeMessageStatus(_id, messageStatus, stepsStatus, session);
        if (!result)
            throw 'CANDIDATE_NOT_FOUND';
    }
    async sendMessage(_id, message) {
        const candidate = await CandidateService_1.default.getCandidateConnection(_id, this.session);
        if (!candidate)
            return "Candidate not found";
        await this.changeMessageStatus(_id, candidate, this.session);
        const { phoneNumber } = candidate;
        const preparePhoneNumber = phoneNumber.split('+')[1] + '@c.us';
        if (!clients['1'])
            return "initializeClient is required to send message";
        await clients['1'].sendMessage(preparePhoneNumber, message);
        return "Message sent successfully";
    }
}
exports.default = WhatsAppController;
const clients = {};
exports.clients = clients;
const initializeClient = (clientId) => {
    if (!clientId) {
        console.error('Client ID is required to initialize WhatsAppClient');
        return;
    }
    if (!clients[clientId]) {
        clients[clientId] = new whatsappService_1.default(clientId);
    }
};
exports.initializeClient = initializeClient;
