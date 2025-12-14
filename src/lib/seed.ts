// Deterministic seed generation from image file bytes

/**
 * Generates a deterministic numeric seed from an image file.
 * Uses a simple hash of the first N bytes and filename.
 * This ensures the same image always produces the same outputs.
 */
export async function seedFromImage(file: File): Promise<number> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  
  // Use first 4KB of bytes + filename for hash
  const hashInput = new Uint8Array(Math.min(bytes.length, 4096) + file.name.length * 2);
  hashInput.set(bytes.slice(0, 4096), 0);
  
  // Add filename bytes
  for (let i = 0; i < file.name.length; i++) {
    const charCode = file.name.charCodeAt(i);
    hashInput[4096 + i * 2] = charCode & 0xff;
    hashInput[4096 + i * 2 + 1] = (charCode >> 8) & 0xff;
  }
  
  // Simple hash function (djb2 variant)
  let hash = 5381;
  for (let i = 0; i < hashInput.length; i++) {
    hash = ((hash << 5) + hash) ^ hashInput[i];
    hash = hash >>> 0; // Convert to unsigned 32-bit
  }
  
  // Return as positive integer
  return Math.abs(hash);
}

/**
 * Seeded pseudo-random number generator (Mulberry32)
 */
export function createSeededRandom(seed: number) {
  let state = seed;
  
  return function(): number {
    state = (state + 0x6D2B79F5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a UUID-like string from seed
 */
export function generateId(seed: number): string {
  const random = createSeededRandom(seed);
  const hex = '0123456789abcdef';
  let uuid = '';
  
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid += '-';
    } else if (i === 14) {
      uuid += '4';
    } else if (i === 19) {
      uuid += hex[(Math.floor(random() * 4) + 8)];
    } else {
      uuid += hex[Math.floor(random() * 16)];
    }
  }
  
  return uuid;
}
