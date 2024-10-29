"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const LinkedinScrape_1 = __importDefault(require("../Controller/LinkedinScrape/LinkedinScrape"));
const LinkedinRouter = (0, express_1.Router)();
LinkedinRouter.post("/generate-new-account", async (req, res) => {
    try {
        const { email, password } = req.body;
        const linkedinScrapeController = new LinkedinScrape_1.default();
        const response = await linkedinScrapeController.generateNewAccount({ email, password, cookies: [], isBusy: false, getCandidate: false, updatedAt: -1 });
        res.status(200).json(response);
        return;
    }
    catch (error) {
        res.status(403).json(error);
        return;
    }
});
LinkedinRouter.post("/post-job", async (req, res) => {
    try {
        const { details } = req.body;
        const linkedinScrapeController = new LinkedinScrape_1.default();
        const response = await linkedinScrapeController.postJob(details);
        res.status(200).json(response);
        return;
    }
    catch (error) {
        res.status(403).json(error);
        return;
    }
});
LinkedinRouter.get('/candidate/:account_id', async (req, res) => {
    try {
        const account_id = req.params.account_id;
        const linkedinScrapeController = new LinkedinScrape_1.default();
        const response = await linkedinScrapeController.getJobDetails(account_id);
        res.json(response);
        return;
    }
    catch (error) {
        res.status(404).json(error);
        return;
    }
});
LinkedinRouter.get('/job-status/:account_id', async (req, res) => {
    try {
        const account_id = req.params.account_id;
        const linkedinScrapeController = new LinkedinScrape_1.default();
        const response = await linkedinScrapeController.getJobStatus(account_id);
        res.json(response);
        return;
    }
    catch (error) {
        res.status(404).json(error);
        return;
    }
});
exports.default = LinkedinRouter;
