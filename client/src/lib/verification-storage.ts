// lib/verification-storage.ts
export const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

// Helper function to clean expired codes
export const cleanExpiredCodes = () => {
  const now = Date.now();
  for (const [email, data] of verificationCodes.entries()) {
    if (now > data.expiresAt) {
      verificationCodes.delete(email);
    }
  }
};
