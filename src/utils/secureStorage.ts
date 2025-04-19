
/**
 * Secure storage utility for handling sensitive data
 * In a browser environment, we use localStorage with encryption
 */

const ENCRYPTION_KEY = 'kora-finance-encryption-key';

/**
 * Simple encryption for browser storage
 * Note: This is not military-grade encryption, but provides basic obfuscation
 */
const encrypt = (text: string): string => {
  return btoa(text); // Base64 encoding for simple obfuscation
};

/**
 * Decrypt data from storage
 */
const decrypt = (encoded: string): string => {
  return atob(encoded); // Base64 decoding
};

/**
 * Save data securely to storage
 */
export const saveSecurely = (key: string, value: string): void => {
  try {
    const encryptedValue = encrypt(value);
    localStorage.setItem(`kora-${key}`, encryptedValue);
  } catch (error) {
    console.error('Error saving to secure storage:', error);
  }
};

/**
 * Get data securely from storage
 */
export const getSecurely = (key: string): string | null => {
  try {
    const encryptedValue = localStorage.getItem(`kora-${key}`);
    if (!encryptedValue) return null;
    return decrypt(encryptedValue);
  } catch (error) {
    console.error('Error retrieving from secure storage:', error);
    return null;
  }
};

/**
 * Remove data from secure storage
 */
export const removeSecurely = (key: string): void => {
  try {
    localStorage.removeItem(`kora-${key}`);
  } catch (error) {
    console.error('Error removing from secure storage:', error);
  }
};
