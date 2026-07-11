import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

const ALGORITHM = "aes-256-cbc";
const IV_BYTE_LENGTH = 16;
const KEY_BYTE_LENGTH = 32;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY?.trim();

  if (!key || key.length !== KEY_BYTE_LENGTH) {
    throw new Error(
      "ENCRYPTION_KEY must be exactly 32 characters in the environment",
    );
  }

  return Buffer.from(key, "utf8");
}

function isEncryptedPayload(value: string): boolean {
  const separatorIndex = value.indexOf(":");

  if (separatorIndex <= 0) {
    return false;
  }

  const ivHex = value.slice(0, separatorIndex);
  const cipherHex = value.slice(separatorIndex + 1);

  return (
    ivHex.length === IV_BYTE_LENGTH * 2 &&
    /^[0-9a-f]+$/i.test(ivHex) &&
    /^[0-9a-f]+$/i.test(cipherHex)
  );
}

export function encryptData(text: string): string {
  if (!text) {
    return text;
  }

  const iv = randomBytes(IV_BYTE_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptData(encryptedText: string): string {
  if (!encryptedText) {
    return encryptedText;
  }

  if (!isEncryptedPayload(encryptedText)) {
    return encryptedText;
  }

  const separatorIndex = encryptedText.indexOf(":");
  const ivHex = encryptedText.slice(0, separatorIndex);
  const cipherHex = encryptedText.slice(separatorIndex + 1);

  const iv = Buffer.from(ivHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), iv);

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(cipherHex, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

export function encryptOptional(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  return encryptData(value);
}

export function decryptOptional(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  return decryptData(value);
}
