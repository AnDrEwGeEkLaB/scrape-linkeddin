import { ClientSession } from "mongoose";
import WhatsAppClient from "../../Service/Whatsapp/whatsappService";
import candidateService from "../../Service/CandidateService/CandidateService";
import ICandidateModel from "../../Model/Candidate/ICandidateModel";
import { HiringSteps, HiringStepsEnum, StatusEnum } from "../../utils";
import axios from "axios";

export default class WhatsAppController {
    session: ClientSession
    constructor(session: ClientSession) {
        this.session = session
    }

    async changeMessageStatus(_id: string, candidate: ICandidateModel, session: ClientSession): Promise<void> {
        const { currentStep, messageStatus, stepsStatus } = candidate;
        const currentStepIndex = HiringSteps.indexOf(currentStep as HiringStepsEnum);
        if (currentStepIndex === -1) {
            throw 'CURRENT_STEP_NOT_FOUND'
        }
        if (currentStepIndex === HiringSteps.length - 1)
            throw 'LAST_HIRING_STEP';
        messageStatus[currentStepIndex].status = StatusEnum.APPROVED;
        stepsStatus[currentStepIndex].status = StatusEnum.APPROVED;
        const result = await candidateService.changeMessageStatus(_id, messageStatus, stepsStatus, session);
        if (!result)
            throw 'CANDIDATE_NOT_FOUND';
    }
    async sendMessage(_id: string, message: string): Promise<string> {
        const candidate = await candidateService.getCandidateConnection(_id, this.session);
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
const clients: { [key: string]: WhatsAppClient } = {};
const initializeClient = (clientId: string) => {
    if (!clientId) {
        console.error('Client ID is required to initialize WhatsAppClient');
        return;
    }
    if (!clients[clientId]) {
        clients[clientId] = new WhatsAppClient(clientId);
    }
};

const getCandidateTask = async (number: string, msg: string): Promise<void> => {
    const phoneNumber = `+${number.split('@')[0]}`;
    const candidate = await candidateService.getCandidateByPhoneNumber(phoneNumber);
    console.log(candidate);
    if (!candidate)
        return;
    const regex = /https:\/\/[^\s]+/g;
    const taskUrl = msg.match(regex)?.join(' , ');
    if (!taskUrl)
        return;
    const data = {

        email: candidate.email,
        taskUrl: taskUrl.toString()
    }
    console.log(data);
    const result = await axios.post('https://api-development.machinegenius.io/un-authorized/candidate', data, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    console.log(result.data);
    return;
}

export { initializeClient, clients, getCandidateTask };