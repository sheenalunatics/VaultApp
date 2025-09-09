import { useState, useEffect } from 'react';
import { encrypt, decrypt } from '../crypto';

interface EncryptedData {
  iv: string;
  ciphertext: string;
}

export function useEncryptedStorage<T>(
  storageKey: string,
  initialValue: T,
  encryptionKey: CryptoKey | null
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue);

  // Load and decrypt data from localStorage when the encryption key becomes available.
  useEffect(() => {
    if (!encryptionKey) {
      return;
    }

    try {
      const item = window.localStorage.getItem(storageKey);
      if (item) {
        const parsed: EncryptedData = JSON.parse(item);
        decrypt(parsed.ciphertext, parsed.iv, encryptionKey)
          .then(decryptedData => {
            if (decryptedData) {
              setValue(JSON.parse(decryptedData));
            }
          })
          .catch(error => {
            console.error("Failed to decrypt data:", error);
            // This can happen with an incorrect password.
            // The UI will show an error, so we don't need to do more here.
          });
      }
    } catch (error) {
      console.error("Could not load encrypted data from localStorage:", error);
    }
  }, [storageKey, encryptionKey]);

  // Encrypt and save data to localStorage whenever the value changes.
  useEffect(() => {
    if (!encryptionKey) {
      return;
    }

    // Don't save the initial (empty) value on first load
    if (JSON.stringify(value) === JSON.stringify(initialValue) && !window.localStorage.getItem(storageKey)) {
        return;
    }

    const saveData = async () => {
      try {
        const stringifiedValue = JSON.stringify(value);
        // Do not save if the value is the initial empty value.
        if (stringifiedValue === JSON.stringify(initialValue) && Array.isArray(value) && value.length === 0) {
            const existingItem = window.localStorage.getItem(storageKey);
            if (!existingItem) return;
        }

        const encrypted = await encrypt(stringifiedValue, encryptionKey);
        window.localStorage.setItem(storageKey, JSON.stringify(encrypted));
      } catch (error) {
        console.error("Could not save encrypted data to localStorage:", error);
      }
    };

    saveData();
  }, [storageKey, value, encryptionKey, initialValue]);

  return [value, setValue];
}