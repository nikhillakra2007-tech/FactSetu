export type VerdictType = 'VERIFIED' | 'CONTRADICTED' | 'UNCERTAIN';
export type InputMode = 'text' | 'image' | 'voice';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface SourceInfo {
  id: string;
  name: string;
  domain: string;
  base_url?: string;
  source_type: string;
  trust_level: number;
  authority_level: number;
  country?: string;
  language?: string;
  is_trusted: boolean;
  is_active?: boolean;
  description?: string;
}

export interface EvidenceItem {
  chunk_id: string;
  chunk_text: string;
  url: string;
  source_name: string;
  relevance_score: number;
  authority?: number;
  published_at?: string;
  support_type?: 'supporting' | 'contradicting' | 'contextual';
}

export interface ClaimVerification {
  id?: string;
  verdict: VerdictType;
  confidence_level?: ConfidenceLevel;
  confidence?: number;
  explanation: string;
  explanation_hi?: string;
}

export interface ClaimItem {
  claim_id: string;
  claim_text: string;
  claim_text_hi?: string;
  normalized_claim?: string;
  claim_type?: string;
  status: 'verified' | 'contradicted' | 'uncertain' | 'processing' | 'pending';
  verification: ClaimVerification;
  evidence: EvidenceItem[];
}

export interface VerificationAuditStep {
  time: string;
  step: string;
  status: 'done' | 'active' | 'pending';
  description?: string;
}

export interface VerificationResultData {
  verification_request_id: string;
  status: 'completed' | 'processing' | 'pending' | 'failed';
  original_input: string;
  input_type?: InputMode;
  created_at?: string;
  claims: ClaimItem[];
  trail?: VerificationAuditStep[];
}

export interface HistoryItem {
  id: string;
  original_input: string;
  status: string;
  primary_verdict?: VerdictType;
  claims_count?: number;
  created_at: string;
  claims?: ClaimItem[];
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role?: string;
  avatar_url?: string;
  provider?: 'google' | 'x' | 'email';
}
