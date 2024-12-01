import express, { Application } from "express";
import cors from "cors";

import LinkedinRouter from "./Router/LinkedinRouter";
const app: Application = express();


app.use(cors());

app.use(express.json());


app.get("/", async (req, res) => {
    res.send("Hello World");
});

app.use("/linkedin", LinkedinRouter);


export { app };
