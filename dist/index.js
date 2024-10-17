"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const DbConfig_1 = require("./DbSetup/DbConfig");
const port = process.env.PORT || 4000;
const server = app_1.app.listen(port, async () => {
    try {
        await (0, DbConfig_1.DBConnection)();
        console.log(`Server is Running And DB Connected and and server http://localhost:${port}`);
    }
    catch (error) {
        console.log(error);
    }
});
server.on('upgrade', (request, socket, head) => {
    app_1.wss.handleUpgrade(request, socket, head, (socket) => {
        app_1.wss.emit('connection', socket, request);
    });
});
exports.default = app_1.app;
