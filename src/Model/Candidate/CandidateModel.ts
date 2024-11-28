import { model, Schema } from "mongoose";
import ICandidateModel, { IStepStatus } from "./ICandidateModel";
import { HiringSteps, statusArr } from "../../utils";


const phoneRegex = /^\+(?:[0-9] ?){6,14}[0-9]$/;

const RequiredString = { type: String, required: true };

const StringValidation = (validation: RegExp, message: string) => {
    return {
        type: String,
        required: true,
        validate: {
            validator: function (v: string) {
                return validation.test(v);
            },
            message
        }
    }
}

const EnumStringRequired = (enumValues: Array<string>, index: number = 0) => {
    return {
        type: String,
        required: true,
        enum: enumValues,
        default: enumValues[index]
    }
}



const stepStatusSchema = new Schema<IStepStatus>({
    step: EnumStringRequired(HiringSteps),
    status: EnumStringRequired(statusArr)
})
const schema = new Schema<ICandidateModel>({
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
        type: Schema.Types.ObjectId,
        ref: 'hiring',
        required: true
    },
    recommendation: {
        type: Schema.Types.ObjectId,
        ref: 'employee',
        default: null
    },
    createdAt: {
        type: Number,
        required: true
    },
    currentStep: EnumStringRequired(HiringSteps, 2),
    stepsStatus: [stepStatusSchema],
    messageStatus: [stepStatusSchema]

});

const candidateModel = model('candidate', schema);
export default candidateModel;

