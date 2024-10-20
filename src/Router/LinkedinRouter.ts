import { Request, Response, Router } from "express";
import LinkedinScrapeController from "../Controller/LinkedinScrape/LinkedinScrape";

const LinkedinRouter = Router();

LinkedinRouter.post("/generate-new-account", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const linkedinScrapeController = new LinkedinScrapeController();
        const response = await linkedinScrapeController.generateNewAccount({ email, password, cookies: [], isBusy: false });
        res.status(200).json(response);
        return;
    } catch (error) {
        res.status(403).json(error);
        return;
    }
});

LinkedinRouter.post("/post-job", async (req: Request, res: Response) => {
    try {
        const { details } = req.body;
        const linkedinScrapeController = new LinkedinScrapeController();
        const response = await linkedinScrapeController.postJob(details);
        res.status(200).json(response);
        return;
    } catch (error) {
        res.status(403).json(error);
        return;
    }
});

LinkedinRouter.get('/candidate/:account_id', async (req: Request, res: Response) => {
    try {
        const account_id = req.params.account_id;
        const linkedinScrapeController = new LinkedinScrapeController();
        const response = await linkedinScrapeController.getJobDetails(account_id);
        res.json(response);
        return;
    } catch (error) {
        res.status(404).json(error);
        return;
    }
})

LinkedinRouter.get('/job-status/:account_id', async (req: Request, res: Response) => {
    try {
        const account_id = req.params.account_id;
        const linkedinScrapeController = new LinkedinScrapeController();
        const response = await linkedinScrapeController.getJobStatus(account_id);
        res.json(response);
        return;
    } catch (error) {
        res.status(404).json(error);
        return;
    }
});

export default LinkedinRouter;