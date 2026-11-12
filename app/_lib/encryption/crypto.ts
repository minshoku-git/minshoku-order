import { createCipheriv, createDecipheriv } from 'crypto';

import { CustomError } from '@/app/errors/customError';

const ENCRYPT_METHOD = 'aes-256-cbc'; // 暗号化方式
const ENCRYPTION_KEY = 'HH95XH7sYAbznRBJSUE9W8RQxzQIGSpy'; // 32Byte. このまま利用しないこと！
const BUFFER_KEY = 'RfHBdAR5RJHqp5wm'; // 16Byte. このまま利用しないこと！
const ENCODING = 'hex'; // 暗号化時のencoding
const UTF8 = 'utf8';

/**
 * encrypt
 * 暗号化
 * @param {string} text - 暗号化対象の文字列
 * @returns {string} - 暗号化した文字列
 */
export const encrypt = (text: string): string => {
  const cipher = createCipheriv(ENCRYPT_METHOD, Buffer.from(ENCRYPTION_KEY), BUFFER_KEY);
  let encrypted = cipher.update(text, UTF8, ENCODING);
  encrypted += cipher.final(ENCODING);
  return encrypted;
};

/**
 * decrypt
 * 復号化
 * @param {string} encrypted - 復号化対象の文字列
 * @returns {string} 復号化した文字列
 */
export const decrypt = (encrypted: string): string => {
  const decipher = createDecipheriv(ENCRYPT_METHOD, Buffer.from(ENCRYPTION_KEY), BUFFER_KEY);
  let decrypted = decipher.update(encrypted, ENCODING, UTF8);
  decrypted += decipher.final(UTF8);
  return decrypted;
};

/**
 * decryptToken
 * URLに含まれるトークンを復号化し、JSONとして解析する。
 * URLの途中切れや余計な文字の混入などで復号化・解析に失敗した場合は、指定したエラーを投げる。
 * 原因を後から追えるよう、トークンの長さと先頭・末尾をログに残す（全文は出さない）。
 * @param {string} token - 復号化対象のトークン
 * @param {{ code: string; message: string; status?: number }} invalidError - 不正なトークンだった場合に投げるエラー
 * @returns {T} 復号化したオブジェクト
 */
export const decryptToken = <T>(token: string, invalidError: { code: string; message: string; status?: number }): T => {
  try {
    return JSON.parse(decrypt(token)) as T;
  } catch (e) {
    console.error(
      `トークンの復号化に失敗しました（長さ:${token.length} 先頭:${token.slice(0, 8)} 末尾:${token.slice(-8)}）`,
      e
    );
    throw new CustomError(invalidError);
  }
};
