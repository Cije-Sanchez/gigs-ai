import CryptoJS from "crypto-js";

export function decryptString(key: string, encryptedString: string) {
  const bytes = CryptoJS.AES.decrypt(encryptedString, key);
  const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
  if (!decryptedText) {
    throw new Error(
      "Decryption failed. Please check the key and encrypted string.",
    );
  }
  return decryptedText;
}
