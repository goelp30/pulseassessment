export interface assessmentRecords {
    assessmentId: string;        // Unique identifier for the assessment
    assessmentName: string;      // Name of the assessment
    userId: string;              // User ID associated with the assessment
    email: string; 
    userName: string;            // Name of the user who took the assessment
    expiryDate: string | Date;   // Expiry date of the assessment
    isLinkAccessed: boolean;     // Whether the link to the assessment has been accessed
    isInProgress: boolean;       // Whether the assessment is in progress
    isCompleted: boolean;        // Whether the assessment is completed
    isActive: boolean;           // Whether the assessment is active
    isExpired: boolean;          // Whether the assessment is expired
    invalidated: boolean;       // Whether the assessment is invalidated
    status?: string;             // Computed status of the assessment (e.g., Active, Expired, etc.)
  }
  