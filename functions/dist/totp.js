"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTotpSecret = generateTotpSecret;
exports.generateTOTP = generateTOTP;
exports.verifyTOTP = verifyTOTP;
const crypto = __importStar(require("crypto"));
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function base32Encode(buffer) {
    let bits = '';
    for (let i = 0; i < buffer.length; i++) {
        bits += buffer[i].toString(2).padStart(8, '0');
    }
    let base32 = '';
    for (let i = 0; i < bits.length; i += 5) {
        const chunk = bits.slice(i, i + 5);
        if (chunk.length < 5) {
            base32 += alphabet[parseInt(chunk.padEnd(5, '0'), 2)];
        }
        else {
            base32 += alphabet[parseInt(chunk, 2)];
        }
    }
    // Add padding
    const padding = (8 - (base32.length % 8)) % 8;
    return base32 + '='.repeat(padding);
}
function base32ToBytes(b32) {
    const clean = b32.replace(/=+$/, '').toUpperCase().replace(/\s+/g, '');
    let bits = '';
    for (const c of clean) {
        const val = alphabet.indexOf(c);
        if (val < 0)
            throw new Error('Invalid base32');
        bits += val.toString(2).padStart(5, '0');
    }
    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        bytes.push(parseInt(bits.slice(i, i + 8), 2));
    }
    return new Uint8Array(bytes);
}
function generateTotpSecret() {
    const buffer = crypto.randomBytes(20); // 160 bits is a common secret length
    return base32Encode(buffer);
}
function generateTOTP(secretBase32, time = Date.now(), step = 30, digits = 6) {
    const counter = Math.floor(time / 1000 / step);
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64BE(BigInt(counter));
    const key = Buffer.from(base32ToBytes(secretBase32));
    const hmac = crypto.createHmac('sha1', key).update(buf).digest();
    const offset = hmac[hmac.length - 1] & 0x0f;
    const code = ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff);
    const mod = 10 ** digits;
    return (code % mod).toString().padStart(digits, '0');
}
function verifyTOTP(secretBase32, token, window = 1, step = 30, digits = 6) {
    const now = Date.now();
    for (let w = -window; w <= window; w++) {
        const t = now + w * step * 1000;
        if (generateTOTP(secretBase32, t, step, digits) === token)
            return true;
    }
    return false;
}
