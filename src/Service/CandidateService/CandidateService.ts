import { ClientSession } from "mongoose";
import ICandidateModel, { IStepStatus } from "../../Model/Candidate/ICandidateModel";
import candidateModel from "../../Model/Candidate/CandidateModel";

class CandidateService {
    async getCandidateConnection(_id: string, session: ClientSession): Promise<ICandidateModel | null> {
        const result = await candidateModel.findById(_id).session(session).select({ phoneNumber: 1, currentStep: 1, email: 1, messageStatus: 1 });
        return result;
    }

    async changeMessageStatus(_id: string, messageStatus: Array<IStepStatus>, session: ClientSession): Promise<ICandidateModel | null> {
        const result = await candidateModel.findByIdAndUpdate(_id, { $set: { messageStatus } }, { new: true }).session(session);
        return result;
    }
}

const candidateService = new CandidateService();

export default candidateService;