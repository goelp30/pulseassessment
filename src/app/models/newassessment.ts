export type SubjectCounts = {
    easy: number;      
    medium: number;    
    hard: number;   
    descriptive: number; 
  };
  
 export  type NewAssessment = {
    assessmentId: string; 
    subjects: {
      [subjectName: string]: SubjectCounts; 
    };
  };
// assessment id
// sub->
//     subjname
//            easy,med,hard,desc
//    subjname
//            easy,med,hard,desc