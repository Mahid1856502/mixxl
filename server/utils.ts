import { randomBytes } from 'crypto';

/**
 * Generate a secure random token for email verification
 */
export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Generate token expiration date (24 hours from now)
 */
export function getTokenExpirationDate(): Date {
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + 24);
  return expirationDate;
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}