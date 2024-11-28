import { ClientSession } from "mongoose";
import ICandidateModel, { IStepStatus } from "../../Model/Candidate/ICandidateModel";
import candidateModel from "../../Model/Candidate/CandidateModel";

class CandidateService {
    async getCandidateConnection(_id: string, session: ClientSession): Promise<ICandidateModel | null> {
        const result = await candidateModel.findById(_id).session(session).select({ phoneNumber: 1, currentStep: 1, email: 1, messageStatus: 1, stepsStatus: 1 });
        return result;
    }

    async changeMessageStatus(_id: string, messageStatus: Array<IStepStatus>, stepsStatus: Array<IStepStatus>, session: ClientSession): Promise<ICandidateModel | null> {
        const result = await candidateModel.findByIdAndUpdate(_id, { $set: { messageStatus, stepsStatus } }, { new: true }).session(session);
        return result;
    }

    async getCandidateByPhoneNumber(phoneNumber: string): Promise<ICandidateModel | null> {
        const result = await candidateModel.findOne({ phoneNumber });
        return result;
    }

}

const candidateService = new CandidateService();

export default candidateService;