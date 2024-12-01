export type Assessment = {
  assessmentId: string,
  assessmentName: string,
  assessmentType: 'internal' | 'external', 
  dateCreated: number,
  dateUpdated: number,
  isDisabled:boolean
  isautoEvaluated:boolean
}
