export interface assessmentRecords {
    assessmentId: string;        
    url:string;
    assessmentName: string;      
    userId: string;             
    email: string; 
    userName: string;            
    expiryDate: string | Date;   
    isLinkAccessed: boolean;     
    isInProgress: boolean;       
    isCompleted: boolean;       
    isActive: boolean;           
    isValid: boolean;       
    assessmentType: string;
    status?: string;          
};

