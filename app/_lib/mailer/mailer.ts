import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { ApiResponse } from '@/app/_types/types';
import { ErrorCodes } from '@/app/errors/ErrorCodes';

/* transport
------------------------------------------------------------------ */
/** SMTPTransport.Options */
const options: SMTPTransport.Options = {
  service: 'gmail',
  auth: {
    user: process.env.GOOGLE_MAIL_USER,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
};
/** transport */
const transporter = nodemailer.createTransport(options);

type Props = {
  title: string;
  text: string;
  to?: string;
};

/* send
------------------------------------------------------------------ */
/**
 * メールを送信します。
 * @param {ApiRequest<string>} req
 */
export const sendMail = async (req: Props): Promise<ApiResponse<null>> => {
  return await transporter
    .sendMail({
      to: 's.abe@refact.co.jp', // TASK
      subject: req.title,
      text: req.text,
    })
    .then(() => {
      const result: ApiResponse<null> = { success: true, data: null };
      return result;
    })
    .catch((error) => {
      console.error((error as Error).message);
      const result: ApiResponse<string> = {
        success: false,
        error: ErrorCodes.EMAIL_SEND_FAILED,
      };
      return result;
    });
};
