// FILE: src/types/ProposalInfo.ts
export interface ProposalInfo {
  projectName: string;
  customerName: string;
  companyName: string;
  customerEmail: string;
  salesContactEmail: string;  // ← NOW MANDATORY
  phoneNumber?: string;
  location?: string;
}