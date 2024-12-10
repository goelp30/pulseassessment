export type Question={
    subjectId:string,
    questionId : any,
    questionText:any,
    questionType:string,
    questionLevel:string,
    questionWeightage:number,
    questionTime:number,
    createdOn:number,
    updatedOn:number,
    isQuesDisabled?: boolean;
}
export type OptionFormat={
    optionId : string,
    optionText:any,
    isCorrectOption:boolean
}
export type Option={
    subjectid:string,
    questionId: string,
    options:{
        [optionId:string]:OptionFormat
    }
   
}

