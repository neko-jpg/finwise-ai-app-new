import * as crypto from 'crypto';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buffer: Buffer): string {
    let bits = '';
    for (let i = 0; i < buffer.length; i++) {
        bits += buffer[i].toString(2).padStart(8, '0');
    }

    let base32 = '';
    for (let i = 0; i < bits.length; i += 5) {
        const chunk = bits.slice(i, i + 5);
        if (chunk.length < 5) {
            base32 += alphabet[parseInt(chunk.padEnd(5, '0'), 2)];
        } else {
            base32 += alphabet[parseInt(chunk, 2)];
        }
    }

    // Add padding
    const padding = (8 - (base32.length % 8)) % 8;
    return base32 + '='.repeat(padding);
}


function base32ToBytes(b32: string): Uint8Array {
  const clean = b32.replace(/=+$/,'').toUpperCase().replace(/\s+/g,'');
  let bits = '';
  for (const c of clean) {
    const val = alphabet.indexOf(c);
    if (val < 0) throw new Error('Invalid base32');
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i+8), 2));
  }
  return new Uint8Array(bytes);
}

export function generateTotpSecret(): string {
    const buffer = crypto.randomBytes(20); // 160 bits is a common secret length
    return base32Encode(buffer);
}

export function generateTOTP(secretBase32: string, time = Date.now(), step = 30, digits = 6): string {
  const counter = Math.floor(time / 1000 / step);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));

  const key = Buffer.from(base32ToBytes(secretBase32));
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();

  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const mod = 10 ** digits;
  return (code % mod).toString().padStart(digits, '0');
}

export function verifyTOTP(secretBase32: string, token: string, window = 1, step = 30, digits = 6): boolean {
  const now = Date.now();
  for (let w = -window; w <= window; w++) {
    const t = now + w * step * 1000;
    if (generateTOTP(secretBase32, t, step, digits) === token) return true;
  }
  return false;
}
