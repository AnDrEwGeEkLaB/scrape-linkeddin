"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const utils_1 = require("../../utils");
const phoneRegex = /^\+(?:[0-9] ?){6,14}[0-9]$/;
const RequiredString = { type: String, required: true };
const StringValidation = (validation, message) => {
    return {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return validation.test(v);
            },
            message
        }
    };
};
const EnumStringRequired = (enumValues, index = 0) => {
    return {
        type: String,
        required: true,
        enum: enumValues,
        default: enumValues[index]
    };
};
const stepStatusSchema = new mongoose_1.Schema({
    step: EnumStringRequired(utils_1.HiringSteps),
    status: EnumStringRequired(utils_1.statusArr)
});
const schema = new mongoose_1.Schema({
    firstName: RequiredString,
    lastName: RequiredString,
    email: RequiredString,
    phoneNumber: StringValidation(phoneRegex, 'Invalid Phone Number'),
    linkedIn: RequiredString,
    role: RequiredString,
    department: RequiredString,
    cvLink: RequiredString,
    portfolio: {
        type: String,
        required: false,
        default: null
    },
    appliedFrom: RequiredString,
    hiring: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'hiring',
        required: true
    },
    recommendation: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'employee',
        default: null
    },
    createdAt: {
        type: Number,
        required: true
    },
    currentStep: EnumStringRequired(utils_1.HiringSteps, 2),
    stepsStatus: [stepStatusSchema],
    messageStatus: [stepStatusSchema]
});
const candidateModel = (0, mongoose_1.model)('candidate', schema);
exports.default = candidateModel;
