export type assessmentRecords = {
  assessmentId: string;
  assessmentName: string;
  userId: string;
  userName: string;
  email:string,
  url: string;
  expiryDate:string,
  invalidated: boolean;
  isActive: Boolean;
  isCompleted: boolean;
  isExpired: Boolean;
  isInProgress: Boolean;
  isLinkAccessed: Boolean;
  status?: string;
};
