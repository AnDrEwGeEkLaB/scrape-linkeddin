import "dotenv/config";
import { app } from "./app";
import { DBConnection } from "./DbSetup/DbConfig";

const port = process.env.PORT || 4000;
const server = app.listen(port, async () => {
    try {
        await DBConnection();
        console.log(`Server is Running And DB Connected and and server http://localhost:${port}`);
    } catch (error) {
        console.log(error);
    }
});

export default app;
