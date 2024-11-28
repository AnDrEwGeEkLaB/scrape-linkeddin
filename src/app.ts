import express, { Application } from "express";
import cors from "cors";

import LinkedinRouter from "./Router/LinkedinRouter";
const app: Application = express();


app.use(cors());

app.use(express.json());

const delay = async (time: number) => {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}
app.get("/", async (req, res) => {
    await delay(3 * 60 * 1000);
    res.send("Hello World");
});

app.use("/linkedin", LinkedinRouter);


export { app };
