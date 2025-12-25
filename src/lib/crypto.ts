// ovibase/src/lib/crypto.ts
import crypto from "crypto";

const ALG = "aes-256-gcm";

function getKey(): Buffer {
  const raw = process.env.SECRET_KEY || process.env.APP_SECRET || "";
  if (!raw) {
    throw new Error(
      "Missing SECRET_KEY (or APP_SECRET) env. Set a strong secret for encryption."
    );
  }

  // Derive a 32-byte key from any length secret
  return crypto.createHash("sha256").update(raw).digest();
}

export type EncryptedSecret = {
  enc: Buffer;
  iv: Buffer;
  tag: Buffer;
};

// Accept Buffer (Prisma Bytes), Uint8Array, or base64 string
type BytesLike = Buffer | Uint8Array | string;

function toBuffer(v: BytesLike): Buffer {
  if (Buffer.isBuffer(v)) return v;
  if (typeof v === "string") return Buffer.from(v, "base64");
  return Buffer.from(v);
}

export function encryptSecret(plain: string): EncryptedSecret {
  const key = getKey();
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(ALG, key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return { enc, iv, tag };
}

export function decryptSecret(input: {
  enc: BytesLike;
  iv: BytesLike;
  tag: BytesLike;
}): string {
  const key = getKey();

  const enc = toBuffer(input.enc);
  const iv = toBuffer(input.iv);
  const tag = toBuffer(input.tag);

  const decipher = crypto.createDecipheriv(ALG, key, iv);
  decipher.setAuthTag(tag);

  const plain = Buffer.concat([decipher.update(enc), decipher.final()]);
  return plain.toString("utf8");
}
