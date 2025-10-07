import { sendMail } from '@/app/_lib/mailer/mailer';
import { createClient, createPgClient } from '@/app/_lib/supabase/server';
import { t_contact } from '@/app/_lib/supabase/tableTypes';
import { rollbackWithLog } from '@/app/_lib/supabase/transaction';
import { formatJstDateTime, getNow } from '@/app/_lib/utils/getDateTime';
import { getPostgreSqlItems } from '@/app/_lib/utils/utils';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { CustomError } from '@/app/errors/customError';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

import { getLoginUserDetail } from '../../../_lib/getLoginUser/getLoginUserDetail';
import { ContactFormValues, ContactMessageDetails } from './types';

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
  const now = formatJstDateTime(getNow());

  try {
    // connection Start
    await pgClient.connect();
    console.log('Connected to the database successfully');

    // Transaction Start
    await pgClient.query('BEGIN');

    /* ユーザー情報取得
    ------------------------------------------------------------------ */
    const user = await getLoginUserDetail(client);

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
    const message = generateContactMessage({
      contactId: result.oid,
      contactMessage: req.contactMessage,
      date: now,
      userName: user.user_name,
      userEmail: user.user_email,
      companyName: user.t_companies.company_name,
      branchName: user.t_companies.branch_name,
    });

    await sendMail({
      title: '【みんしょく】ユーザーからのお問い合わせを受信しました',
      text: message,
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

const generateContactMessage = (details: ContactMessageDetails): string => {
  const { contactId, contactMessage, date, userName, userEmail, companyName, branchName } = details;

  return `
運営ご担当者様

お疲れ様です。  
以下の通り、ユーザーよりお問い合わせがありましたので、共有いたします。

────────────────────  
■ お問い合わせ日時  
${date}
■ お問合せ番号
${contactId}

■ ユーザー情報  
・お名前：${userName}  
・会社名：${companyName}  
・部署名：${branchName}  
・メールアドレス：${userEmail}

■ お問い合わせ内容  
――――――――――――――――  
${contactMessage}
――――――――――――――――

ご確認のほど、よろしくお願いいたします。

（自動送信）`.trim();
};
