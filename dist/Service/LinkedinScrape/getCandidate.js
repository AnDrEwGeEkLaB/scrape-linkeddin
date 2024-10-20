"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const LinkedinScrapeService_1 = __importDefault(require("./LinkedinScrapeService"));
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const delay = async (time) => {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
};
class GetCandidate extends LinkedinScrapeService_1.default {
    async uploadToS3(bucket, key, data) {
        const s3Client = new client_s3_1.S3Client({
            region: "us-east-1",
            credentials: {
                accessKeyId: process.env.ACCESS_KEY_ID,
                secretAccessKey: process.env.SECRET_ACCESS_KEY,
            },
        });
        const params = {
            Bucket: bucket,
            Key: key,
            Body: data,
            ContentType: "application/pdf",
            ACL: "public-read-write",
        };
        try {
            const command = new client_s3_1.PutObjectCommand(params);
            const data = await s3Client.send(command);
        }
        catch (err) {
            console.log("Error", err);
        }
    }
    async setUpDownloadDir() {
        console.log(__dirname);
        this.downloadDir = path_1.default.resolve(__dirname, "../downloaded-CV");
        if (!fs.existsSync(this.downloadDir)) {
            fs.mkdirSync(this.downloadDir);
        }
        await this.page._client().send("Page.setDownloadBehavior", {
            behavior: "allow",
            downloadPath: this.downloadDir,
        });
        console.log("Finish");
    }
    async getApplicants() {
        if (!this.page)
            throw new Error("Browser has not been launched.");
        console.log("Start get Applicants");
        await this.setUpDownloadDir();
        console.log("end set up download");
        await this.page.goto("https://www.linkedin.com/my-items/posted-jobs/", {
            waitUntil: "domcontentloaded",
        });
        await delay(1000);
        console.log("Navigated to the applicant jobs page");
        await this.page.evaluate(() => {
            console.log("Clicking the first job");
            const openJob = Array.from(document.querySelectorAll(".workflow-results-container ul li a.app-aware-link"));
            if (openJob.length > 0) {
                console.log("openJob found, clicking it ====> ", openJob[0].innerText, openJob[1].innerText);
                openJob[1].click();
            }
            else {
                console.log("No job found");
            }
        });
        await delay(5000);
        await this.page.evaluate(() => {
            console.log("Clicking the View applicants button");
            const clickJob = Array.from(document.querySelectorAll(".hiring-job-top-card__job-action button"));
            if (clickJob) {
                console.log("clickJob found, clicking it");
                clickJob[0].click();
            }
        });
        await delay(5000);
        const applicantURLsResults = [];
        let currentPage = 1;
        while (true) {
            const applicantURLs = await this.page.evaluate(() => {
                const applicant = [];
                const anchors = document.querySelectorAll(".artdeco-list li a");
                Array.from(anchors).forEach((anchor) => {
                    console.log("================", anchor.href);
                    let href = anchor.href;
                    if (href.startsWith("/")) {
                        href = `https://www.linkedin.com${href}`;
                    }
                    applicant.push(href);
                });
                return applicant;
            });
            applicantURLsResults.push(...applicantURLs);
            currentPage += 1;
            const button = await this.page.$(`button[aria-label="Page ${currentPage}"]`);
            if (button) {
                console.log("Clicking the next page button ====>", currentPage);
                await button.click();
                await delay(5000);
            }
            else {
                console.log("No more pages to click");
                break;
            }
        }
        console.log("Applicant URLs:", applicantURLsResults);
        const applicantDetails = await this.extractApplicantDetails(applicantURLsResults);
        return applicantDetails;
    }
    async extractApplicantDetails(applicantURLs) {
        if (!this.page)
            throw new Error("Browser has not been launched.");
        const details = [];
        for (const url of applicantURLs) {
            try {
                await this.page.goto(url, {
                    waitUntil: "domcontentloaded",
                    timeout: 120000,
                });
                // Click the "More" button to reveal additional data
                await this.page.click(".hiring-applicant-header-actions > div:last-of-type button");
                await delay(2000); // Wait for the data to load
                // Extract name
                const name = await this.page.evaluate(() => {
                    const nameElement = document.querySelector("h1.display-flex.align-items-center.t-24");
                    return nameElement
                        ? nameElement.innerText.split("’s application")[0].trim()
                        : "";
                });
                // Extract profile link, email, and phone from three li > ul
                const { profileLink, email, phone } = await this.page.evaluate(() => {
                    const dropdownItems = document.querySelectorAll(".artdeco-dropdown__content-inner ul li");
                    const result = {
                        profileLink: "",
                        email: "",
                        phone: "",
                    };
                    if (dropdownItems.length >= 3) {
                        const profileElement = dropdownItems[0].querySelector("a");
                        result.profileLink = profileElement ? profileElement.href : "";
                        const emailElement = dropdownItems[1].querySelector(".hiring-applicant-header-actions__more-content-dropdown-item-text");
                        result.email =
                            emailElement && emailElement.textContent
                                ? emailElement.textContent.trim()
                                : "";
                        const phoneElement = dropdownItems[2].querySelector(".hiring-applicant-header-actions__more-content-dropdown-item-text");
                        result.phone =
                            phoneElement && phoneElement.textContent
                                ? phoneElement.textContent.trim()
                                : "";
                    }
                    return result;
                });
                // Download CV to the local folder
                let cvPath = null;
                let fileName = null;
                try {
                    const cvDownloadElement = await this.page.$(".display-flex.justify-space-between.align-items-flex-start.pl5.pr5.pt5.pb3 a");
                    if (cvDownloadElement) {
                        await cvDownloadElement.click();
                        await delay(5000); // Wait for the download to complete
                        fileName = `${email}.pdf`;
                        cvPath = path_1.default.join(this.downloadDir, fileName);
                        // set CV Name to the applicant's name
                        const files = fs.readdirSync(this.downloadDir);
                        const latestFile = files
                            .map((file) => ({
                            name: file,
                            time: fs
                                .statSync(path_1.default.join(this.downloadDir, file))
                                .mtime.getTime(),
                        }))
                            .sort((a, b) => b.time - a.time)
                            .map((file) => file.name)[0];
                        fs.renameSync(path_1.default.join(this.downloadDir, latestFile), cvPath);
                        const data = fs.readFileSync(cvPath);
                        await this.uploadToS3("machine-genius", `cv/${fileName}`, data);
                        await fs.unlinkSync(cvPath);
                    }
                }
                catch (error) {
                    console.log(`No CV found in this url for ${name}: ${error}`);
                }
                if (name) {
                    details.push({
                        url,
                        name,
                        profileLink,
                        email,
                        phone,
                        cvPath: "https://machine-genius.s3.amazonaws.com/cv/" + fileName,
                    });
                }
                await delay(4000);
            }
            catch (error) {
                console.error(`Failed to extract details from ${url}:`, error);
            }
        }
        return details;
    }
    async getJobStatus() {
        if (!this.page)
            throw new Error("Browser has not been launched.");
        console.log("Start get Job Status");
        await this.page.goto("https://www.linkedin.com/my-items/posted-jobs/", {
            waitUntil: "domcontentloaded",
        });
        await delay(3000);
        const checkStatus = await this.page.evaluate(() => {
            console.log("Clicking the first job");
            const openJob = document.querySelector(".tvm__text.tvm__text");
            console.log("========================>", openJob.innerText);
            return openJob.innerText;
        });
        return checkStatus;
    }
    async closeJob() {
        if (!this.page)
            throw new Error("Browser has not been launched.");
        await this.page.evaluate(() => {
            console.log("Clicking the first job");
            const openJob = Array.from(document.querySelectorAll(".workflow-results-container ul li a.app-aware-link"));
            if (openJob.length > 0) {
                console.log("openJob found, clicking it ====> ", openJob[0].innerText, openJob[1].innerText);
                openJob[1].click();
            }
            else {
                console.log("No job found");
            }
        });
        await delay(5000);
        await this.page.evaluate(() => {
            console.log("Clicking close job button");
            const clickJob = Array.from(document.querySelectorAll(".hiring-job-top-card__job-action button"));
            if (clickJob) {
                console.log("clickJob found, clicking it");
                console.log(clickJob[1].innerText);
                //clickJob[1].click();
            }
        });
        await delay(20000);
    }
}
exports.default = GetCandidate;
