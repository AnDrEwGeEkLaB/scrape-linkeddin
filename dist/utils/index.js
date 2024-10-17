"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HiringStepsEnum = exports.StatusEnum = exports.statusArr = exports.HiringSteps = void 0;
var HiringStepsEnum;
(function (HiringStepsEnum) {
    HiringStepsEnum["REQUEST_HIRING"] = "REQUEST_HIRING";
    HiringStepsEnum["Job_Listings"] = "Job_Listings";
    HiringStepsEnum["Get_Job_Candidates"] = "Get_Job_Candidates";
    HiringStepsEnum["Schedule_Interview_Call"] = "Schedule_Interview_Call";
    HiringStepsEnum["Interview_Call_Question"] = "Interview_Call_Question";
    HiringStepsEnum["Tasks"] = "Tasks";
    HiringStepsEnum["Schedule_Face_To_Face_Interview"] = "Schedule_Face_To_Face_Interview";
    HiringStepsEnum["Job_Offer"] = "Job_Offer";
    HiringStepsEnum["Required_Documents"] = "Required_Documents";
})(HiringStepsEnum || (exports.HiringStepsEnum = HiringStepsEnum = {}));
const HiringSteps = [
    'REQUEST_HIRING',
    'Job_Listings',
    "Get_Job_Candidates",
    'Schedule_Interview_Call',
    'Interview_Call_Question',
    'Tasks',
    'Schedule_Face_To_Face_Interview',
    'Job_Offer',
    'Required_Documents'
];
exports.HiringSteps = HiringSteps;
var StatusEnum;
(function (StatusEnum) {
    StatusEnum["APPROVED"] = "Approved";
    StatusEnum["REJECTED"] = "Rejected";
    StatusEnum["PENDING"] = "Pending";
})(StatusEnum || (exports.StatusEnum = StatusEnum = {}));
const statusArr = ['Pending', 'Approved', 'Rejected'];
exports.statusArr = statusArr;
