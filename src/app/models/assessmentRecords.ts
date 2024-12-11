export interface assessmentRecords {
    assessmentId: string;        
    assessmentName: string;      
    userId: string;             
    email: string; 
    userName: string;            
    expiryDate: string | Date;   
    isLinkAccessed: boolean;     
    isInProgress: boolean;       
    isCompleted: boolean;       
    isActive: boolean;           
    isvalid: boolean;       
    assessmentType: string;
    status?: string;          

  }
  