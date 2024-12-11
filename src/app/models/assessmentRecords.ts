export type assessmentRecords = {
  assessmentId: string;
  assessmentName: string;
  assessmentType:string;
  userId: string;
  userName: string;
  email:string,
  url: string;
  expiryDate:string | Date;
  isValid: boolean;
  isActive: Boolean;
  isCompleted: boolean;
  isInProgress: Boolean;
  isLinkAccessed: Boolean;
  status?: string;
};

