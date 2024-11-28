enum HiringStepsEnum {
    REQUEST_HIRING = 'REQUEST_HIRING',
    Job_Listings = 'Job_Listings',
    Get_Job_Candidates = "Get_Job_Candidates",
    Schedule_Interview_Call = 'Schedule_Interview_Call',
    Interview_Call_Question = 'Interview_Call_Question',
    Tasks = 'Tasks',
    Schedule_Face_To_Face_Interview = 'Schedule_Face_To_Face_Interview',
    Job_Offer = 'Job_Offer',
    Required_Documents = 'Required_Documents'
}
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

enum StatusEnum {
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
    PENDING = 'Pending'
}

const statusArr = ['Pending', 'Approved', 'Rejected']


export { HiringSteps, statusArr, StatusEnum, HiringStepsEnum };