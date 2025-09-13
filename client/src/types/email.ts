// types/email.ts
export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerificationResponse {
  message: string;
  code?: string;
  expiresAt?: number;
  success: boolean;
}

export interface MailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  headers?: {
    'X-Mailer'?: string;
    'X-Priority'?: string;
  };
}
