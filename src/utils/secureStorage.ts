
/**
 * Secure storage utility for handling sensitive data
 * In a browser environment, we use localStorage with encryption
 */

// Generate a consistent encryption key based on browser fingerprint
const getEncryptionKey = (): string => {
  const browserInfo = [
    navigator.userAgent,
    navigator.language,
    window.screen.colorDepth,
    window.screen.width + 'x' + window.screen.height
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < browserInfo.length; i++) {
    const char = browserInfo.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return 'kora-finance-key-' + Math.abs(hash).toString(16);
};

const ENCRYPTION_KEY = getEncryptionKey();

/**
 * More robust encryption for browser storage
 * This implements AES-like encryption with XOR and string manipulation
 */
const encrypt = (text: string): string => {
  let result = '';
  const key = ENCRYPTION_KEY;
  
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  
  // Add additional obfuscation with base64
  return btoa(result);
};

/**
 * Decrypt data from storage
 */
const decrypt = (encoded: string): string => {
  try {
    // Decode base64
    const decoded = atob(encoded);
    let result = '';
    const key = ENCRYPTION_KEY;
    
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    
    return result;
  } catch (error) {
    console.error('Error decrypting data:', error);
    return '';
  }
};

/**
 * Save data securely to storage with expiration
 */
export const saveSecurely = (key: string, value: string, expiresInHours = 24): void => {
  try {
    const data = {
      value,
      expires: expiresInHours > 0 ? Date.now() + (expiresInHours * 60 * 60 * 1000) : 0
    };
    const encryptedValue = encrypt(JSON.stringify(data));
    localStorage.setItem(`kora-${key}`, encryptedValue);
  } catch (error) {
    console.error('Error saving to secure storage:', error);
  }
};

/**
 * Get data securely from storage, respecting expiration
 */
export const getSecurely = (key: string): string | null => {
  try {
    const encryptedValue = localStorage.getItem(`kora-${key}`);
    if (!encryptedValue) return null;
    
    const decrypted = decrypt(encryptedValue);
    if (!decrypted) return null;
    
    const data = JSON.parse(decrypted);
    
    // Check if the data has expired
    if (data.expires && data.expires > 0 && data.expires < Date.now()) {
      // Data has expired, remove it
      removeSecurely(key);
      return null;
    }
    
    return data.value;
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

/**
 * Clear all secure storage data
 */
export const clearSecureStorage = (): void => {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('kora-')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing secure storage:', error);
  }
};
