export interface MeetingTranscript {
  id: string;
  content: string;
  filename?: string;
  uploadedAt: Date;
}

export interface SummaryRequest {
  transcript: string;
  customPrompt: string;
}

export interface GeneratedSummary {
  id: string;
  content: string;
  prompt: string;
  generatedAt: Date;
  isEdited: boolean;
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface ShareRequest {
  summary: GeneratedSummary;
  recipients: EmailRecipient[];
  subject: string;
  message: string;
}