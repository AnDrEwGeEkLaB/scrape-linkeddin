import { Cookie } from "puppeteer";
import ILinkedinAccountCookiesModel from "../../Model/LinkedinAccounts/ILinkedinAccountCookiesModel";

export default interface ILinkedinAccountCookiesService {
    saveCookies(cookies: ILinkedinAccountCookiesModel): Promise<ILinkedinAccountCookiesModel>;
    getCookies(_id: string): Promise<ILinkedinAccountCookiesModel | null>;
    updateCookies(_id: string, cookies: Cookie[]): Promise<ILinkedinAccountCookiesModel | null>;
}