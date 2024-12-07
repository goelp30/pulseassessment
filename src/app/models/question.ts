export type Question={
    Subjectid:string,
    questionId : any,
    questionText:any,
    questionType:string,
    questionLevel:string,
    questionWeitage:string,
    answer:string[],
    option:string[],
    questionTime:string,
    createdOn:number,
    UpdatedOn:number,
    isquesDisabled?: boolean;
}

export type QuestionSet={
    SubjectId:string
}