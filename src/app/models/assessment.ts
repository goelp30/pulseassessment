export type Assessment = {
  assessmentId: string,
  assessmentName: string,
  assessmentType: 'internal' | 'external', 
  dateCreated: number,
  dateUpdated: number,
  isDisabled:boolean,
  isautoEvaluated:boolean
}
// }
// type newAssessment=[{
//   assessmentId: string(from assessment table),
//   subjectId:string (from subject table),
//   easy:number,
//   medium:number,
//   hard:number,
//   descriptive:number
// },{
//   assessmentId: string,
//   assessmentName:string,
//   subjectId:string,
//   subjectName:string,
//   easy:number,
//   medium:number,
//   hard:number,
//   descriptive:number
// }]

// can i create a nested table structurein firebase i want to store like assessment name-> then subject-> where each subject has easy medim hard descriptive ques like assessmentlist:[{assessmentname:'react asessment',included_subjects:[{'angular':['easy':4,"medium':2,'hard':1}],'react':['easy':4,"medium':0,'hard':2}]}