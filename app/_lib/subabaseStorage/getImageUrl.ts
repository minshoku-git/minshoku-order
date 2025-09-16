import { SupabaseClient } from '@supabase/supabase-js';

import { EXPIRES_IN_TIME } from '@/app/_types/constants';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

/**
 * 画像URLを取得する
 * @param {SupabaseClient} client
 * @param {string} bucketName
 * @param {string} filePath
 * @returns {string} - imageUrl
 */
export const getImageUrl = (client: SupabaseClient, bucketName: string, filePath: string): string => {
  try {
    const {
      data: { publicUrl },
    } = client.storage.from(bucketName).getPublicUrl(filePath);

    if (!publicUrl) {
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '店舗画像の取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    // 取得した画像のURLを返す
    return publicUrl;
  } catch (e) {
    console.error(e);
    if (e instanceof CustomError) {
      throw e;
    }
    throw new CustomError(ErrorCodes.INTERNAL_SERVER_ERROR);
  }
};

/**
 * 署名付き画像URLを取得する
 *
 * TODO:
 * storageのpolicy設定が最重要かつ仕様詰めが必要
 * supabaseAuthenticationを利用する場合、
 * 認証済みユーザーのみ許可するように設定変更した方がいい
 * 現在は全てのユーザーに対してアクセス許可を出している
 *
 * @param {SupabaseClient} client
 * @param {string} bucketName
 * @param {string} filePath
 * @returns {string} - 署名付き画像URL
 */
export const getImageSignedUrl = async (
  client: SupabaseClient,
  bucketName: string,
  filePath: string
): Promise<string> => {
  try {
    // 署名付きURLを生成
    console.log(bucketName, filePath);
    const { data, error } = await client.storage.from(bucketName).createSignedUrl(filePath, EXPIRES_IN_TIME);

    if (error) {
      console.error(error);
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '店舗画像の取得' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }
    return data.signedUrl;
  } catch (e) {
    if (e instanceof CustomError) {
      throw e;
    }
    console.error(e);
    throw new CustomError(ErrorCodes.INTERNAL_SERVER_ERROR);
  }
};
