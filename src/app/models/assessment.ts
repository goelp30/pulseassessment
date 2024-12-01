export type Assessment = {
    assessmentId: string,
      assessmentName: string,
      assessmentType: 'internal'| 'external', 
      subjectId: string,
      subjectName: string,
      dateCreated: number
}