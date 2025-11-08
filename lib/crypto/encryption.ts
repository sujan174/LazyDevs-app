/**
 * Token encryption utility for secure storage
 * Uses Web Crypto API for client-side encryption
 */

// NOTE: For production, the encryption key should be stored securely
// Consider using environment variables or a secure key management service
const ENCRYPTION_KEY_STRING = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-key-change-in-production-123456';

/**
 * Derive a crypto key from a string
 */
async function deriveKey(password: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('lazydevs-salt-2024'), // In production, use a random salt per user
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a token
 * @param token - The token to encrypt
 * @returns Encrypted token as base64 string
 */
export async function encryptToken(token: string): Promise<string> {
  try {
    const key = await deriveKey(ENCRYPTION_KEY_STRING);
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(token)
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt token');
  }
}

/**
 * Decrypt a token
 * @param encryptedToken - The encrypted token as base64 string
 * @returns Decrypted token
 */
export async function decryptToken(encryptedToken: string): Promise<string> {
  try {
    const key = await deriveKey(ENCRYPTION_KEY_STRING);
    const dec = new TextDecoder();

    // Convert from base64
    const combined = Uint8Array.from(atob(encryptedToken), c => c.charCodeAt(0));

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    return dec.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt token');
  }
}

/**
 * Server-side encryption (for API routes)
 * Uses Node.js crypto module
 */
export function encryptTokenServer(token: string): string {
  // For server-side, we'll use a simpler approach
  // In production, consider using a proper encryption library like @node-rs/bcrypt
  const crypto = require('crypto');
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(ENCRYPTION_KEY_STRING, 'salt', 32);
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Combine IV, authTag, and encrypted data
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Server-side decryption
 */
export function decryptTokenServer(encryptedToken: string): string {
  const crypto = require('crypto');
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(ENCRYPTION_KEY_STRING, 'salt', 32);

  const [ivHex, authTagHex, encrypted] = encryptedToken.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
