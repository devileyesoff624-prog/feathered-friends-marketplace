/**
 * End-to-End Encryption using ECDH key exchange + AES-GCM.
 *
 * Flow:
 * 1. Each user generates an ECDH key pair on first use.
 * 2. Private key is stored in IndexedDB (persistent, not cleared like localStorage).
 * 3. Public key (JWK) is stored in the profiles table.
 * 4. To encrypt a message for another user, derive a shared secret via ECDH,
 *    then use AES-GCM with a random IV.
 * 5. Encrypted payload = base64(iv + ciphertext). Prefixed with "e2e:" to distinguish.
 */

const DB_NAME = "bird-bazaar-e2e";
const STORE_NAME = "keys";
const KEY_ID = "ecdh-private-key";

// --- IndexedDB helpers ---

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getFromIDB(key: string): Promise<any> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function putToIDB(key: string, value: any): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// --- Key generation & management ---

export async function generateKeyPair(): Promise<{ privateKey: CryptoKey; publicKeyJwk: JsonWebKey }> {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true, // extractable for export
    ["deriveKey"]
  );
  const publicKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  // Store private key as JWK in IndexedDB
  const privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
  await putToIDB(KEY_ID, privateKeyJwk);
  return { privateKey: keyPair.privateKey, publicKeyJwk };
}

export async function getStoredPrivateKey(): Promise<CryptoKey | null> {
  const jwk = await getFromIDB(KEY_ID);
  if (!jwk) return null;
  return crypto.subtle.importKey("jwk", jwk, { name: "ECDH", namedCurve: "P-256" }, false, ["deriveKey"]);
}

export async function importPublicKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey("jwk", jwk, { name: "ECDH", namedCurve: "P-256" }, false, []);
}

// --- Shared secret derivation ---

async function deriveAESKey(privateKey: CryptoKey, publicKey: CryptoKey): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    { name: "ECDH", public: publicKey },
    privateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// --- Encrypt / Decrypt ---

const E2E_PREFIX = "e2e:";

function arrayBufferToBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function base64ToArrayBuffer(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

export async function encryptMessage(
  plaintext: string,
  myPrivateKey: CryptoKey,
  theirPublicKey: CryptoKey
): Promise<string> {
  const aesKey = await deriveAESKey(myPrivateKey, theirPublicKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, encoded);

  // Combine iv + ciphertext
  const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return E2E_PREFIX + arrayBufferToBase64(combined.buffer);
}

export async function decryptMessage(
  encrypted: string,
  myPrivateKey: CryptoKey,
  theirPublicKey: CryptoKey
): Promise<string> {
  if (!encrypted.startsWith(E2E_PREFIX)) return encrypted; // Not encrypted

  const data = base64ToArrayBuffer(encrypted.slice(E2E_PREFIX.length));
  const bytes = new Uint8Array(data);
  const iv = bytes.slice(0, 12);
  const ciphertext = bytes.slice(12);

  const aesKey = await deriveAESKey(myPrivateKey, theirPublicKey);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, aesKey, ciphertext);
  return new TextDecoder().decode(decrypted);
}

export function isEncrypted(content: string): boolean {
  return content.startsWith(E2E_PREFIX);
}
