import { Cookie } from "puppeteer";
import ILinkedinAccountCookiesModel from "../../Model/LinkedinAccounts/ILinkedinAccountCookiesModel";

export default interface ILinkedinAccountCookiesService {
    saveCookies(cookies: ILinkedinAccountCookiesModel): Promise<ILinkedinAccountCookiesModel>;
    getCookies(_id: string): Promise<ILinkedinAccountCookiesModel | null>;
    updateCookies(_id: string, cookies: Cookie[]): Promise<ILinkedinAccountCookiesModel | null>;
    getFreeAccount(): Promise<ILinkedinAccountCookiesModel & { _id: string } | null>;
    updateBusyAccount(_id: string, isBusy: boolean): Promise<ILinkedinAccountCookiesModel | null>
}