import { Cookie } from "puppeteer";
import ILinkedinAccountCookiesModel from "../../Model/LinkedinAccounts/ILinkedinAccountCookiesModel";
import LinkedinAccountCookiesService from "../../Service/LinkedinAccountCookies/LinkedinAccountCookiesService";
import LinkedInScraperService from "../../Service/LinkedinScrape/LinkedinScrapeService";
import GetCandidate from "../../Service/LinkedinScrape/getCandidate";

export default class LinkedinScrapeController {
    linkedinScrapeService: GetCandidate;
    constructor() {
        this.linkedinScrapeService = new GetCandidate();
    }
    async generateNewAccount(linkedinAccount: ILinkedinAccountCookiesModel): Promise<ILinkedinAccountCookiesModel> {
        const linkedinAccountCookiesService = new LinkedinAccountCookiesService();
        await this.linkedinScrapeService.launchBrowser();
        await this.linkedinScrapeService.login(linkedinAccount.email, linkedinAccount.password);
        const cookies = await this.linkedinScrapeService.getCookies();
        await this.linkedinScrapeService.closeBrowser();
        const account: ILinkedinAccountCookiesModel = {
            cookies: cookies,
            email: linkedinAccount.email,
            password: linkedinAccount.password,
            isBusy: false,
            getCandidate: false,
            updatedAt: -1
        };
        const result = await linkedinAccountCookiesService.saveCookies(account);
        return result;
    }

    async up(_id: string, email: string, password: string): Promise<string> {
        await this.linkedinScrapeService.launchBrowser();
        await this.updateAccountCookies(_id, email, password);
        await this.linkedinScrapeService.closeBrowser();
        return "Updated";
    }

    async updateAccountCookies(_id: string, email: string, password: string): Promise<Cookie[]> {
        console.log("Enter Update Account Cookies");
        const linkedinAccountCookiesService = new LinkedinAccountCookiesService();
        await this.linkedinScrapeService.login(email, password);
        const cookies: Cookie[] = await this.linkedinScrapeService.getCookies();
        await linkedinAccountCookiesService.updateCookies(_id, cookies);
        console.log("Update Account Cookies");
        return cookies;
    }

    async postJob(details: any): Promise<string> {
        const linkedinAccountCookiesService = new LinkedinAccountCookiesService();

        const getAccountCookies = await linkedinAccountCookiesService.getFreeAccount();
        console.log("=================================");
        console.log(getAccountCookies?.cookies);
        console.log("=================================");
        await this.linkedinScrapeService.launchBrowser();
        if (!getAccountCookies) {
            return "No Account Available";
        } else {
            await this.linkedinScrapeService.loadCookies(getAccountCookies.cookies || []);
            const checkProfile = await this.linkedinScrapeService.checkProfile();
            const profileUrlPattern = /^https:\/\/www\.linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;

            if (!profileUrlPattern.test(checkProfile)) {
                const newCookies = await this.updateAccountCookies(getAccountCookies._id, getAccountCookies.email, getAccountCookies.password);
                await this.linkedinScrapeService.loadCookies(newCookies);
            }
            const checkWhichForm = await this.linkedinScrapeService.checkWhichForm();
            if (checkWhichForm === "Second_Form") {
                console.log("Second Form");
                await this.linkedinScrapeService.postJobSecondForm(
                    details.jobTitle,
                    details.contract_type,
                    details.description,
                    details.questions
                );
            }
            else {
                console.log("First Form");
                await this.linkedinScrapeService.postJobFirstForm(
                    details.jobTitle,
                    details.contract_type,
                    details.description,
                    details.questions
                );
            }
            const newCookies = await this.linkedinScrapeService.getCookies();
            console.log("=================================");
            console.log(newCookies);
            console.log("=================================");
            await linkedinAccountCookiesService.updateCookies(getAccountCookies._id, newCookies);
            await this.linkedinScrapeService.closeBrowser();
            await linkedinAccountCookiesService.updateBusyAccount(getAccountCookies._id, true, true);
            return getAccountCookies._id;
        }
    }

    async getJobDetails(account_id: string): Promise<any> {
        const linkedinAccountCookiesService = new LinkedinAccountCookiesService();
        const getAccountCookies = await linkedinAccountCookiesService.getCookies(account_id);
        if (!getAccountCookies) {
            return "No Account Available";
        }
        await this.linkedinScrapeService.launchBrowser();
        await this.linkedinScrapeService.loadCookies(getAccountCookies.cookies);
        const checkProfile = await this.linkedinScrapeService.checkProfile();
        const profileUrlPattern = /^https:\/\/www\.linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;

        if (!profileUrlPattern.test(checkProfile)) {
            const newCookies = await this.updateAccountCookies(account_id, getAccountCookies.email, getAccountCookies.password);
            await this.linkedinScrapeService.loadCookies(newCookies);
        }
        const result = await this.linkedinScrapeService.getApplicants();
        const newCookies = await this.linkedinScrapeService.getCookies();
        await linkedinAccountCookiesService.updateCookies(account_id, newCookies);
        await this.linkedinScrapeService.closeBrowser();
        return result;
    }


    async getJobStatus(account_id: string): Promise<any> {
        const linkedinAccountCookiesService = new LinkedinAccountCookiesService();
        const getAccountCookies = await linkedinAccountCookiesService.getCookies(account_id);
        if (!getAccountCookies) {
            return "No Account Available";
        }
        await this.linkedinScrapeService.launchBrowser();
        await this.linkedinScrapeService.loadCookies(getAccountCookies.cookies);
        const checkProfile = await this.linkedinScrapeService.checkProfile();
        const profileUrlPattern = /^https:\/\/www\.linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;

        if (!profileUrlPattern.test(checkProfile)) {
            const newCookies = await this.updateAccountCookies(account_id, getAccountCookies.email, getAccountCookies.password);
            await this.linkedinScrapeService.loadCookies(newCookies);
        }
        const result = await this.linkedinScrapeService.getJobStatus();
        if (result === "Paused")
            await this.linkedinScrapeService.closeJob();
        const newCookies = await this.linkedinScrapeService.getCookies();
        await linkedinAccountCookiesService.updateCookies(account_id, newCookies);
        await linkedinAccountCookiesService.updateBusyAccount(account_id, true, false);
        await this.linkedinScrapeService.closeBrowser();
        return result;
    }
}