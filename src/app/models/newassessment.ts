export type SubjectCounts = {
    easy: number;      
    medium: number;    
    hard: number;   
    descriptive: number; 
  };
  
 export  type AssessmentList = {
    assessmentId: string; 
    dateCreated: number,
    dateUpdated: number,
    subjects: {
      [subjectId: string]: SubjectCounts; 
    };
  };
// assessment id:junior react 
// sub->
//     subjname:angular
//            easy,med,hard,desc
//    subjname:react
//            easy,med,hard,desc

// assessment id:juniorjs assessment
// sub->
//     subjname:angular
//            easy,med,hard,desc
//    subjname:react
//            easy,med,hard,desc