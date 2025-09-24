import { sendMail } from '@/app/_lib/mailer/mailer';
import { createClient, createPgClient } from '@/app/_lib/supabase/server';
import { t_contact } from '@/app/_lib/supabase/tableTypes';
import { rollbackWithLog } from '@/app/_lib/supabase/transaction';
import { getPostgreSqlItems } from '@/app/_lib/utill';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { getAuth } from '../../order/_lib/function copy';
import { ContactFormValues } from './types';

/**
 * sendContactMail
 * 問い合わせ情報の新規登録とメール送信
 *
 * @param { ApiRequest<ContactFormValues>} values - 入力情報
 * @returns {Promise<ApiResponse<null>>} 結果
 */
export const sendContactMail = async (values: ApiRequest<ContactFormValues>): Promise<ApiResponse<null>> => {
  const req = values.request;
  const client = await createClient();
  const pgClient = createPgClient();

  try {
    // connection Start
    await pgClient.connect();
    console.log('Connected to the database successfully');

    // Transaction Start
    await pgClient.query('BEGIN');

    /* ユーザー情報取得
    ------------------------------------------------------------------ */
    const user = await getAuth(client);

    /* 問い合わせ新規追加
  　------------------------------------------------------------------ */
    const insertValues: Omit<t_contact, 'id' | 'created_at' | 'updated_at'> = {
      t_companies_id: user.t_companies_id,
      t_companies_department_id: user.t_companies_department_id,
      t_companies_employment_status_id: user.t_companies_employment_status_id,
      t_user_id: user.id,
      contact_message: req.contactMessage,
    };
    const { columns, placeholders, values } = getPostgreSqlItems(insertValues);
    const insertUserText = `INSERT INTO t_contact (${columns.join(',')}) VALUES (${placeholders}) RETURNING id;`;

    const result = await pgClient.query(insertUserText, values);
    if (result.rowCount === 0) {
      throw new CustomError(
        ErrorCodes.NOT_FOUND.code,
        '問い合わせ情報の新規登録' + ErrorCodes.NOT_FOUND.message,
        ErrorCodes.NOT_FOUND.status
      );
    }

    /* メール送信
  　------------------------------------------------------------------ */
    await sendMail({
      mailType: 'contact',
      senderUserName: user.user_name,
      senderEmail: user.user_email,
      text: req.contactMessage,
    });

    /* --------------------------------------------------------------- */
    // throw new Error('疑似エラー:ロールバックを確認しました。');

    // Commit
    await pgClient.query('COMMIT');

    return { success: true, data: null };
  } catch (e: unknown) {
    console.error('Transaction failed:', e);
    await rollbackWithLog(pgClient);

    if (e instanceof CustomError) {
      return {
        success: false,
        error: {
          code: e.code,
          message: e.message,
        },
      };
    }
    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_SERVER_ERROR.code,
        message: ErrorCodes.INTERNAL_SERVER_ERROR.message,
      },
    };
  } finally {
    // Transaction End
    await pgClient.end();
  }
};
