// crypto.ts

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16; // 128 bits
const IV_LENGTH = 12; // 96 bits for AES-GCM

// Helper to convert ArrayBuffer to Base64 string
export const bufferToBase64 = (buffer: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

// Helper to convert Base64 string to ArrayBuffer
export const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Generates a random salt
export const generateSalt = (): Uint8Array => {
  return window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
};

// Derives a key from a password and salt using PBKDF2
export const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const passwordBuffer = new TextEncoder().encode(password);
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

// Hashes a password with a salt for verification
export const hashPassword = async (password: string, salt: Uint8Array): Promise<ArrayBuffer> => {
    const passwordBuffer = new TextEncoder().encode(password);
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
    );

    return await window.crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256',
        },
        keyMaterial,
        256 // We want a 256-bit hash
    );
};


// Encrypts data using AES-GCM
export const encrypt = async (data: string, key: CryptoKey): Promise<{ iv: string; ciphertext: string }> => {
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encodedData = new TextEncoder().encode(data);

  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encodedData
  );

  return {
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(ciphertext),
  };
};

// Decrypts data using AES-GCM
export const decrypt = async (ciphertext: string, iv: string, key: CryptoKey): Promise<string> => {
  const ivBuffer = base64ToBuffer(iv);
  const ciphertextBuffer = base64ToBuffer(ciphertext);

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
    },
    key,
    ciphertextBuffer
  );

  return new TextDecoder().decode(decrypted);
};