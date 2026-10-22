/**
 * @license
 * SPDX-License-Identifier: MIT
 * 
 * PasswordSaver Core Web Crypto Engine
 * Zero-server, client-side-only AES-GCM 256-bit encryption with PBKDF2 key derivation.
 */

export interface EncryptedPayload {
  salt: string;       // Base64 encoded 16-byte salt
  iv: string;         // Base64 encoded 12-byte IV
  ciphertext: string; // Base64 encoded ciphertext
}

export interface CredentialItem {
  id: string;
  title: string;
  username: string;
  encryptedPassword: string; // Serialized EncryptedPayload
  url?: string;
  category: 'logins' | 'finance' | 'work' | 'personal' | 'social' | 'notes';
  notes?: string;
  favorite?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface VaultMetadata {
  version: number;
  createdAt: number;
  verificationToken: EncryptedPayload; // Verifies master key without revealing it
}

export interface VaultExport {
  app: 'PasswordSaver';
  version: number;
  exportedAt: string;
  metadata: VaultMetadata;
  credentials: CredentialItem[];
}

const SENTINEL_PHRASE = 'PW_SAVER_MASTER_KEY_VERIFIED_SENTINEL_2026';
const PBKDF2_ITERATIONS = 100000;

// Convert BufferSource to Base64
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Convert Base64 to Uint8Array
export function base64ToBuffer(base64: string): Uint8Array {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derive AES-GCM 256-bit CryptoKey from a Master Password / PIN using PBKDF2
 */
export async function deriveKey(masterPassword: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const rawKey = enc.encode(masterPassword);
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    rawKey.buffer as ArrayBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt arbitrary plaintext with a derived CryptoKey or master password
 */
export async function encryptText(plaintext: string, keyOrPassword: CryptoKey | string): Promise<EncryptedPayload> {
  const enc = new TextEncoder();
  const encodedPlaintext = enc.encode(plaintext);

  let key: CryptoKey;
  let salt: Uint8Array;

  if (typeof keyOrPassword === 'string') {
    salt = window.crypto.getRandomValues(new Uint8Array(16));
    key = await deriveKey(keyOrPassword, salt);
  } else {
    key = keyOrPassword;
    salt = new Uint8Array(0); // If reusing pre-derived key
  }

  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const cipherBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv.buffer as ArrayBuffer,
    },
    key,
    encodedPlaintext.buffer as ArrayBuffer
  );

  return {
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(cipherBuffer),
  };
}

/**
 * Decrypt an EncryptedPayload
 */
export async function decryptText(payload: EncryptedPayload, keyOrPassword: CryptoKey | string): Promise<string> {
  const ivBuffer = base64ToBuffer(payload.iv);
  const cipherBuffer = base64ToBuffer(payload.ciphertext);

  let key: CryptoKey;
  if (typeof keyOrPassword === 'string') {
    const saltBuffer = base64ToBuffer(payload.salt);
    key = await deriveKey(keyOrPassword, saltBuffer);
  } else {
    key = keyOrPassword;
  }

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer.buffer as ArrayBuffer,
    },
    key,
    cipherBuffer.buffer as ArrayBuffer
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}

/**
 * Create a verification token for vault setup
 */
export async function createVerificationToken(masterPassword: string): Promise<EncryptedPayload> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(masterPassword, salt);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();

  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    enc.encode(SENTINEL_PHRASE).buffer as ArrayBuffer
  );

  return {
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(cipherBuffer),
  };
}

/**
 * Verify if candidate master password matches the verification token
 */
export async function verifyMasterPassword(candidatePassword: string, token: EncryptedPayload): Promise<{ valid: boolean; key?: CryptoKey }> {
  try {
    const saltBuffer = base64ToBuffer(token.salt);
    const key = await deriveKey(candidatePassword, saltBuffer);
    const decrypted = await decryptText(token, key);
    if (decrypted === SENTINEL_PHRASE) {
      return { valid: true, key };
    }
    return { valid: false };
  } catch {
    return { valid: false };
  }
}

/**
 * Password Generator Options
 */
export interface GeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  avoidAmbiguous: boolean;
  passphraseMode?: boolean;
  wordCount?: number;
}

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIGUOUS = /[il1Lo0O]/g;

const WORDLIST = [
  'amber', 'azure', 'breeze', 'cedar', 'cobalt', 'crane', 'crest', 'dawn', 'drift', 'dusk',
  'echo', 'ember', 'falcon', 'flint', 'frost', 'glade', 'haven', 'hawk', 'haze', 'iron',
  'jade', 'jasper', 'lark', 'lynx', 'marsh', 'meadow', 'mist', 'moss', 'nebula', 'oasis',
  'ocean', 'opal', 'orbit', 'pine', 'polar', 'prism', 'quartz', 'raven', 'ridge', 'river',
  'sage', 'shadow', 'sierra', 'silver', 'solar', 'spark', 'spruce', 'star', 'stone', 'storm',
  'swift', 'tide', 'timber', 'topaz', 'trail', 'vale', 'valley', 'vapor', 'velvet', 'zenith'
];

/**
 * Generate cryptographically secure random password or passphrase
 */
export function generatePassword(options: GeneratorOptions): string {
  if (options.passphraseMode) {
    const count = options.wordCount || 4;
    const words: string[] = [];
    const randomVals = new Uint32Array(count);
    window.crypto.getRandomValues(randomVals);

    for (let i = 0; i < count; i++) {
      const idx = randomVals[i] % WORDLIST.length;
      let word = WORDLIST[idx];
      if (options.uppercase) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      words.push(word);
    }

    let result = words.join('-');
    if (options.numbers) {
      const numBytes = new Uint8Array(2);
      window.crypto.getRandomValues(numBytes);
      result += `-${(numBytes[0] % 90 + 10)}`;
    }
    if (options.symbols) {
      const symBytes = new Uint8Array(1);
      window.crypto.getRandomValues(symBytes);
      result += SYMBOLS[symBytes[0] % SYMBOLS.length];
    }
    return result;
  }

  let charset = '';
  if (options.lowercase) charset += LOWERCASE;
  if (options.uppercase) charset += UPPERCASE;
  if (options.numbers) charset += NUMBERS;
  if (options.symbols) charset += SYMBOLS;

  if (options.avoidAmbiguous) {
    charset = charset.replace(AMBIGUOUS, '');
  }

  if (!charset) {
    charset = LOWERCASE + NUMBERS;
  }

  const length = Math.max(8, Math.min(64, options.length));
  const randomBytes = new Uint8Array(length);
  window.crypto.getRandomValues(randomBytes);

  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[randomBytes[i] % charset.length];
  }

  return result;
}

/**
 * Password Strength Evaluator
 */
export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  labelKey: string;
  entropy: number;
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  hasLength: boolean;
}

export function evaluateStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      labelKey: 'strength_empty',
      entropy: 0,
      hasLower: false,
      hasUpper: false,
      hasNumber: false,
      hasSymbol: false,
      hasLength: false,
    };
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const hasLength = password.length >= 12;

  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasNumber) poolSize += 10;
  if (hasSymbol) poolSize += 32;

  const entropy = Math.round(password.length * (poolSize > 0 ? Math.log2(poolSize) : 0));

  let score: 0 | 1 | 2 | 3 | 4 = 0;
  if (password.length >= 8) score = 1;
  if (password.length >= 10 && (hasLower && hasUpper || hasNumber && hasSymbol)) score = 2;
  if (password.length >= 12 && entropy >= 50) score = 3;
  if (password.length >= 16 && entropy >= 75 && (hasLower && hasUpper && hasNumber && hasSymbol)) score = 4;

  const labels = ['strength_very_weak', 'strength_weak', 'strength_fair', 'strength_strong', 'strength_ultra'];

  return {
    score,
    labelKey: labels[score],
    entropy,
    hasLower,
    hasUpper,
    hasNumber,
    hasSymbol,
    hasLength,
  };
}
