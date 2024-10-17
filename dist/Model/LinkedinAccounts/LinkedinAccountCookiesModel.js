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
});
const LinkedinAccountCookiesModel = (0, mongoose_1.model)("LinkedinAccountCookies", LinkedinAccountCookiesSchema);
exports.default = LinkedinAccountCookiesModel;
