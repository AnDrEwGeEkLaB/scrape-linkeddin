import { model, Schema } from "mongoose";
import ILinkedinAccountCookiesModel from "./ILinkedinAccountCookiesModel";
const LinkedinAccountCookiesSchema = new Schema<ILinkedinAccountCookiesModel>({
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

const LinkedinAccountCookiesModel = model<ILinkedinAccountCookiesModel>("linkedin-account-cookie", LinkedinAccountCookiesSchema);

export default LinkedinAccountCookiesModel;