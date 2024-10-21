"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CandidateModel_1 = __importDefault(require("../../Model/Candidate/CandidateModel"));
class CandidateService {
    async getCandidateConnection(_id, session) {
        const result = await CandidateModel_1.default.findById(_id).session(session).select({ phoneNumber: 1, currentStep: 1, email: 1, messageStatus: 1 });
        return result;
    }
    async changeMessageStatus(_id, messageStatus, stepsStatus, session) {
        const result = await CandidateModel_1.default.findByIdAndUpdate(_id, { $set: { messageStatus, stepsStatus } }, { new: true }).session(session);
        return result;
    }
    async getCandidateByPhoneNumber(phoneNumber) {
        const result = await CandidateModel_1.default.findOne({ phoneNumber });
        return result;
    }
}
const candidateService = new CandidateService();
exports.default = candidateService;
