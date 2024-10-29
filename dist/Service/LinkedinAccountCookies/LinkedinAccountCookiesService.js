"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const LinkedinAccountCookiesModel_1 = __importDefault(require("../../Model/LinkedinAccounts/LinkedinAccountCookiesModel"));
class LinkedinAccountCookiesService {
    async saveCookies(cookies) {
        try {
            const newCookies = new LinkedinAccountCookiesModel_1.default(cookies);
            const result = await newCookies.save();
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async getCookies(_id) {
        return await LinkedinAccountCookiesModel_1.default.findById(_id);
    }
    async updateCookies(_id, cookies) {
        return await LinkedinAccountCookiesModel_1.default.findByIdAndUpdate(_id, { cookies }, { new: true });
    }
    async getFreeAccount() {
        return await LinkedinAccountCookiesModel_1.default.findOne({ isBusy: false });
    }
    async updateBusyAccount(_id, isBusy, getCandidate) {
        const timeStampAfter7Days = new Date().valueOf() + 7 * 24 * 60 * 60 * 1000;
        return await LinkedinAccountCookiesModel_1.default.findByIdAndUpdate(_id, { isBusy, getCandidate, updatedAt: timeStampAfter7Days }, { new: true });
    }
    async getBusyAccount() {
        return await LinkedinAccountCookiesModel_1.default.find({ isBusy: true });
    }
}
exports.default = LinkedinAccountCookiesService;
