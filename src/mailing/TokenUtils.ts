import * as crypto from 'crypto';

export function generateTokenFromEmail(email: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(email);
  return hash.digest('hex');
}
