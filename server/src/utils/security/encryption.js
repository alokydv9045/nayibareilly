/**
 * Encryption Utility
 * Data encryption and decryption utilities
 * @module utils/security/encryption
 */

import crypto from 'crypto';

/**
 * Encryption configuration
 */
const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16,
  saltLength: 64,
  tagLength: 16,
  iterations: 100000,
  digest: 'sha512'
};

/**
 * Get encryption key from environment
 */
function getEncryptionKey() {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    console.warn('[Encryption] No ENCRYPTION_KEY found in environment, using default (INSECURE)');
    return 'default-encryption-key-change-in-production-32-chars-long!!!';
  }
  
  // Ensure key is correct length
  if (key.length < ENCRYPTION_CONFIG.keyLength) {
    return key.padEnd(ENCRYPTION_CONFIG.keyLength, '0');
  }
  
  return key.slice(0, ENCRYPTION_CONFIG.keyLength);
}

/**
 * Encrypt data
 * @param {string} text - Text to encrypt
 * @returns {string} Encrypted data in format: iv:tag:encrypted
 */
export function encrypt(text) {
  try {
    if (!text) return '';

    const key = Buffer.from(getEncryptionKey());
    const iv = crypto.randomBytes(ENCRYPTION_CONFIG.ivLength);
    
    const cipher = crypto.createCipheriv(ENCRYPTION_CONFIG.algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Return format: iv:tag:encrypted
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('[Encryption] Error encrypting data:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt data
 * @param {string} encryptedData - Encrypted data in format: iv:tag:encrypted
 * @returns {string} Decrypted text
 */
export function decrypt(encryptedData) {
  try {
    if (!encryptedData) return '';

    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivHex, tagHex, encrypted] = parts;
    
    const key = Buffer.from(getEncryptionKey());
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ENCRYPTION_CONFIG.algorithm, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('[Encryption] Error decrypting data:', error);
    throw new Error('Decryption failed');
  }
}

/**
 * Hash data with salt
 * @param {string} data - Data to hash
 * @param {string} salt - Optional salt (will generate if not provided)
 * @returns {Object} { hash, salt }
 */
export function hashWithSalt(data, salt = null) {
  try {
    const actualSalt = salt || crypto.randomBytes(ENCRYPTION_CONFIG.saltLength).toString('hex');
    
    const hash = crypto.pbkdf2Sync(
      data,
      actualSalt,
      ENCRYPTION_CONFIG.iterations,
      ENCRYPTION_CONFIG.keyLength,
      ENCRYPTION_CONFIG.digest
    ).toString('hex');
    
    return { hash, salt: actualSalt };
  } catch (error) {
    console.error('[Encryption] Error hashing data:', error);
    throw new Error('Hashing failed');
  }
}

/**
 * Verify hashed data
 * @param {string} data - Original data
 * @param {string} hash - Hash to verify against
 * @param {string} salt - Salt used in hashing
 * @returns {boolean} True if match
 */
export function verifyHash(data, hash, salt) {
  try {
    const { hash: computedHash } = hashWithSalt(data, salt);
    return computedHash === hash;
  } catch (error) {
    console.error('[Encryption] Error verifying hash:', error);
    return false;
  }
}

/**
 * Generate random token
 * @param {number} length - Token length in bytes
 * @returns {string} Random token
 */
export function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate secure random password
 * @param {number} length - Password length
 * @returns {string} Random password
 */
export function generateSecurePassword(length = 16) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const charsetLength = charset.length;
  const randomBytes = crypto.randomBytes(length);
  
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charsetLength];
  }
  
  return password;
}

/**
 * Create HMAC signature
 * @param {string} data - Data to sign
 * @param {string} secret - Secret key
 * @returns {string} HMAC signature
 */
export function createHMAC(data, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');
}

/**
 * Verify HMAC signature
 * @param {string} data - Original data
 * @param {string} signature - Signature to verify
 * @param {string} secret - Secret key
 * @returns {boolean} True if valid
 */
export function verifyHMAC(data, signature, secret) {
  const expectedSignature = createHMAC(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export default {
  encrypt,
  decrypt,
  hashWithSalt,
  verifyHash,
  generateToken,
  generateSecurePassword,
  createHMAC,
  verifyHMAC
};
