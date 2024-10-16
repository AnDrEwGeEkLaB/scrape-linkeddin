import { Types } from "mongoose";

export interface IStepStatus {

    step: string,
    status: string

}
export default interface ICandidateModel {
    firstName: string,
    lastName: string,
    phoneNumber: string,
    email: string,
    linkedIn: string,
    role: string,
    cvLink: string,
    portfolio: string,
    department: string,
    appliedFrom: string,
    hiring: Types.ObjectId,
    createdAt: number,
    recommendation: Types.ObjectId | null,
    currentStep: string,
    stepsStatus: Array<IStepStatus>,
    messageStatus: Array<IStepStatus>
}