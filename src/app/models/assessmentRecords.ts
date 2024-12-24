export interface assessmentRecords {
  assessmentId: string;
  url: string;
  assessmentName: string;
  userId: string;
  email: string;
  userName: string;
  expiryDate: string | Date;
  isAccessed: boolean;
  inProgress: boolean;
  isCompleted: boolean;
  isActive: boolean;
  isValid: boolean;
  assessmentType: string;
  status?: string;
}
