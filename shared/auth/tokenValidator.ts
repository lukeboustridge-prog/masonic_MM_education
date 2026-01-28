import type { TokenPayload, TokenValidationResult, UserData } from './types';

const TOKEN_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Validates an access token and extracts user data
 * Token format: base64url(JSON payload).base64url(HMAC-SHA256 signature)
 */
export async function validateAccessToken(
  token: string | null,
  secret: string
): Promise<TokenValidationResult> {
  if (!token) {
    return { valid: false, error: 'No access token provided' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Invalid token format' };
  }

  const [payloadB64, signatureB64] = parts;

  try {
    // Decode payload
    const payloadJson = base64UrlDecode(payloadB64);
    const payload: TokenPayload = JSON.parse(payloadJson);

    // Verify signature
    const expectedSignature = await computeHmacSignature(payloadJson, secret);
    if (signatureB64 !== expectedSignature) {
      return { valid: false, error: 'Invalid token signature' };
    }

    // Check timestamp validity
    const now = Date.now();
    const tokenAge = now - payload.timestamp;
    if (tokenAge < 0 || tokenAge > TOKEN_VALIDITY_MS) {
      return { valid: false, error: 'Token has expired' };
    }

    // Extract user data
    const user: UserData = {
      userId: payload.userId,
      name: payload.name,
      rank: payload.rank,
      initiationDate: payload.initiationDate,
      isGrandOfficer: payload.isGrandOfficer,
    };

    return { valid: true, user };
  } catch {
    return { valid: false, error: 'Failed to decode token' };
  }
}

/**
 * Decode base64url string to UTF-8 string
 */
function base64UrlDecode(str: string): string {
  // Convert base64url to base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

  // Add padding if needed
  const padding = base64.length % 4;
  if (padding) {
    base64 += '='.repeat(4 - padding);
  }

  // Decode
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Compute HMAC-SHA256 signature and return as base64url
 */
async function computeHmacSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  return base64UrlEncode(new Uint8Array(signature));
}

/**
 * Encode Uint8Array to base64url string
 */
function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  const base64 = btoa(binary);
  // Convert to base64url
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
