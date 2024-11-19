"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const LinkedinAccountCookiesSchema = new mongoose_1.Schema({
    cookies: Object,
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    isBusy: { type: Boolean, default: false },
    getCandidate: { type: Boolean, default: false },
    updatedAt: { type: Number }
});
const LinkedinAccountCookiesModel = (0, mongoose_1.model)("linkedin-account-cookie", LinkedinAccountCookiesSchema);
exports.default = LinkedinAccountCookiesModel;
