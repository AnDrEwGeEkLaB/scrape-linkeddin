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
        return await LinkedinAccountCookiesModel.findByIdAndUpdate(_id, {cookies}, { new: true });
    }
}
