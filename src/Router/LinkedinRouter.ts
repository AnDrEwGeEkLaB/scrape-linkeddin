import { Request, Response, Router } from "express";
import LinkedinScrapeController from "../Controller/LinkedinScrape/LinkedinScrape";

const LinkedinRouter = Router();

LinkedinRouter.post("/generate-new-account", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const linkedinScrapeController = new LinkedinScrapeController();
        const response = await linkedinScrapeController.generateNewAccount({ email, password, cookies: [] });
        res.status(200).json(response);
        return;
    } catch (error) {
        res.status(403).json(error);
        return;
    }
});

LinkedinRouter.post("/post-job", async (req: Request, res: Response) => {
    try {
        const { account_id, details } = req.body;
        const linkedinScrapeController = new LinkedinScrapeController();
        const response = await linkedinScrapeController.postJob(account_id, details);
        res.status(200).json("Job Posted Successfully");
        return;
    } catch (error) {
        res.status(403).json(error);
        return;
    }
});

export default LinkedinRouter;