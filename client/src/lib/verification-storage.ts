// lib/verification-storage.ts
export const verificationCodes = new Map<string, { code: string; expiresAt: number }>();
