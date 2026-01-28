export interface UserData {
  userId: string;
  name: string;
  rank: string;
  initiationDate: string;
  isGrandOfficer: boolean;
}

export interface TokenPayload extends UserData {
  timestamp: number;
}

export interface TokenValidationResult {
  valid: boolean;
  user?: UserData;
  error?: string;
}
