"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const LinkedinAccountCookiesService_1 = __importDefault(require("../../Service/LinkedinAccountCookies/LinkedinAccountCookiesService"));
const getCandidate_1 = __importDefault(require("../../Service/LinkedinScrape/getCandidate"));
class LinkedinScrapeController {
    constructor() {
        this.linkedinScrapeService = new getCandidate_1.default();
    }
    async generateNewAccount(linkedinAccount) {
        try {
            const linkedinAccountCookiesService = new LinkedinAccountCookiesService_1.default();
            await this.linkedinScrapeService.launchBrowser();
            await this.linkedinScrapeService.login(linkedinAccount.email, linkedinAccount.password);
            const cookies = await this.linkedinScrapeService.getCookies();
            await this.linkedinScrapeService.closeBrowser();
            const account = {
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
        catch (error) {
            this.linkedinScrapeService.closeBrowser();
            throw error;
        }
    }
    async up(_id, email, password) {
        try {
            await this.linkedinScrapeService.launchBrowser();
            await this.updateAccountCookies(_id, email, password);
            await this.linkedinScrapeService.closeBrowser();
            return "Updated";
        }
        catch (error) {
            this.linkedinScrapeService.closeBrowser();
            throw error;
        }
    }
    async updateAccountCookies(_id, email, password) {
        try {
            console.log("Enter Update Account Cookies");
            const linkedinAccountCookiesService = new LinkedinAccountCookiesService_1.default();
            await this.linkedinScrapeService.login(email, password);
            const cookies = await this.linkedinScrapeService.getCookies();
            await linkedinAccountCookiesService.updateCookies(_id, cookies);
            console.log("Update Account Cookies");
            return cookies;
        }
        catch (error) {
            throw error;
        }
    }
    async postJob(details) {
        try {
            const linkedinAccountCookiesService = new LinkedinAccountCookiesService_1.default();
            const getAccountCookies = await linkedinAccountCookiesService.getFreeAccount();
            console.log("=================================");
            console.log(getAccountCookies?.cookies);
            console.log("=================================");
            await this.linkedinScrapeService.launchBrowser();
            if (!getAccountCookies) {
                return "No Account Available";
            }
            else {
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
                    await this.linkedinScrapeService.postJobSecondForm(details.jobTitle, details.contract_type, details.description, details.questions);
                }
                else {
                    console.log("First Form");
                    await this.linkedinScrapeService.postJobFirstForm(details.jobTitle, details.contract_type, details.description, details.questions);
                }
                const newCookies = await this.linkedinScrapeService.getCookies();
                console.log("=================================");
                console.log(newCookies);
                console.log("=================================");
                await linkedinAccountCookiesService.updateCookies(getAccountCookies._id, newCookies);
                await this.linkedinScrapeService.closeBrowser();
                await linkedinAccountCookiesService.updateBusyAccount(getAccountCookies._id, true, true, -1);
                return getAccountCookies._id;
            }
        }
        catch (error) {
            await this.linkedinScrapeService.closeBrowser();
            throw error;
        }
    }
    async getJobDetails(account_id) {
        try {
            const linkedinAccountCookiesService = new LinkedinAccountCookiesService_1.default();
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
        catch (error) {
            await this.linkedinScrapeService.closeBrowser();
            throw error;
        }
    }
    async getJobStatus(account_id) {
        try {
            const linkedinAccountCookiesService = new LinkedinAccountCookiesService_1.default();
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
            if (result === "Paused") {
                await this.linkedinScrapeService.closeJob();
                const timeStampAfter7Days = new Date().valueOf() + 7 * 24 * 60 * 60 * 1000;
                await linkedinAccountCookiesService.updateBusyAccount(account_id, true, false, timeStampAfter7Days);
            }
            const newCookies = await this.linkedinScrapeService.getCookies();
            await linkedinAccountCookiesService.updateCookies(account_id, newCookies);
            await this.linkedinScrapeService.closeBrowser();
            return result;
        }
        catch (error) {
            await this.linkedinScrapeService.closeBrowser();
            throw error;
        }
    }
}
exports.default = LinkedinScrapeController;
