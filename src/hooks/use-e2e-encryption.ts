import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  generateKeyPair,
  getStoredPrivateKey,
  importPublicKey,
  encryptMessage,
  decryptMessage,
  isEncrypted,
} from "@/lib/e2e-crypto";

/**
 * Hook that manages E2E encryption keys and provides encrypt/decrypt helpers.
 */
export function useE2EEncryption() {
  const { user } = useAuth();
  const [ready, setReady] = useState(false);
  const privateKeyRef = useRef<CryptoKey | null>(null);
  const publicKeyCacheRef = useRef<Map<string, CryptoKey>>(new Map());

  // Initialize: ensure we have a key pair and it's published to the profile
  useEffect(() => {
    if (!user) return;

    const init = async () => {
      let privateKey = await getStoredPrivateKey();

      if (!privateKey) {
        // Generate new key pair
        const { privateKey: newPrivate, publicKeyJwk } = await generateKeyPair();
        privateKey = newPrivate;

        // Store public key in profile
        await supabase
          .from("profiles")
          .update({ encryption_public_key: JSON.stringify(publicKeyJwk) } as any)
          .eq("user_id", user.id);
      } else {
        // Check if public key is published
        const { data: profile } = await supabase
          .from("profiles")
          .select("encryption_public_key")
          .eq("user_id", user.id)
          .single();

        if (!(profile as any)?.encryption_public_key) {
          // Re-export and publish
          // We need to re-generate since we can't export a non-extractable key
          const { publicKeyJwk } = await generateKeyPair();
          privateKey = await getStoredPrivateKey();
          await supabase
            .from("profiles")
            .update({ encryption_public_key: JSON.stringify(publicKeyJwk) } as any)
            .eq("user_id", user.id);
        }
      }

      privateKeyRef.current = privateKey;
      setReady(true);
    };

    init().catch(console.error);
  }, [user]);

  const getOtherPublicKey = useCallback(async (otherUserId: string): Promise<CryptoKey | null> => {
    const cached = publicKeyCacheRef.current.get(otherUserId);
    if (cached) return cached;

    const { data } = await supabase
      .from("profiles")
      .select("encryption_public_key")
      .eq("user_id", otherUserId)
      .single();

    const keyStr = (data as any)?.encryption_public_key;
    if (!keyStr) return null;

    try {
      const jwk = JSON.parse(keyStr);
      const pubKey = await importPublicKey(jwk);
      publicKeyCacheRef.current.set(otherUserId, pubKey);
      return pubKey;
    } catch {
      return null;
    }
  }, []);

  const encrypt = useCallback(async (plaintext: string, otherUserId: string): Promise<string> => {
    if (!privateKeyRef.current) return plaintext;
    const theirKey = await getOtherPublicKey(otherUserId);
    if (!theirKey) return plaintext; // Fallback: send unencrypted
    return encryptMessage(plaintext, privateKeyRef.current, theirKey);
  }, [getOtherPublicKey]);

  const decrypt = useCallback(async (content: string, otherUserId: string): Promise<string> => {
    if (!isEncrypted(content)) return content;
    if (!privateKeyRef.current) return "🔒 Encrypted message";
    const theirKey = await getOtherPublicKey(otherUserId);
    if (!theirKey) return "🔒 Encrypted message";
    try {
      return await decryptMessage(content, privateKeyRef.current, theirKey);
    } catch {
      return "🔒 Unable to decrypt";
    }
  }, [getOtherPublicKey]);

  return { ready, encrypt, decrypt, isEncrypted };
}
