import ILinkedinAccountCookiesService from "./ILinkedinAccountCookiesService";
import ILinkedinAccountCookiesModel from "../../Model/LinkedinAccounts/ILinkedinAccountCookiesModel";
import LinkedinAccountCookiesModel from "../../Model/LinkedinAccounts/LinkedinAccountCookiesModel";
import { Cookie } from "puppeteer";

export default class LinkedinAccountCookiesService implements ILinkedinAccountCookiesService {
    async saveCookies(cookies: ILinkedinAccountCookiesModel): Promise<ILinkedinAccountCookiesModel> {
        try {
            const newCookies = new LinkedinAccountCookiesModel(cookies);
            const result = await newCookies.save();
            return result;
        } catch (error) {
            throw error;
        }
    }


    async getCookies(_id: string): Promise<ILinkedinAccountCookiesModel | null> {
        return await LinkedinAccountCookiesModel.findById(_id);
    }

    async updateCookies(_id: string, cookies: Cookie[]): Promise<ILinkedinAccountCookiesModel | null> {
        return await LinkedinAccountCookiesModel.findByIdAndUpdate(_id, { cookies }, { new: true });
    }

    async getFreeAccount(): Promise<ILinkedinAccountCookiesModel & { _id: string } | null> {
        return await LinkedinAccountCookiesModel.findOne({ isBusy: false });
    }

    async updateBusyAccount(_id: string, isBusy: boolean, getCandidate: boolean,timeStamp:number): Promise<ILinkedinAccountCookiesModel | null> {
        return await LinkedinAccountCookiesModel.findByIdAndUpdate(_id, { isBusy, getCandidate, updatedAt: timeStamp }, { new: true });
    }

    async getBusyAccount(): Promise<Array<ILinkedinAccountCookiesModel & { _id: string }>> {
        return await LinkedinAccountCookiesModel.find({ isBusy: true });
    }
}
