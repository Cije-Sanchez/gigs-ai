"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptString = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
function decryptString(key, encryptedString) {
    const bytes = crypto_js_1.default.AES.decrypt(encryptedString, key);
    const decryptedText = bytes.toString(crypto_js_1.default.enc.Utf8);
    if (!decryptedText) {
        throw new Error("Decryption failed. Please check the key and encrypted string.");
    }
    return decryptedText;
}
exports.decryptString = decryptString;
//# sourceMappingURL=crypto.js.map