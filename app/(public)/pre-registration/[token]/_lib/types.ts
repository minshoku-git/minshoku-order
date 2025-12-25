import z from 'zod';

/**
 * 仮登録完了 入力用バリデーションスキーマ
 */
export const NextPageInitSchema = z
  .object({
    /** 暗号 */
    token: z.string(),
  })
  .strict();

/**
 * 仮登録完了 API用バリデーションスキーマ
 */
export const NextPageInitApiSchema = z
  .object({
    request: NextPageInitSchema,
  })
  .strict();

/**
 * 仮登録完了 initRequest
 */
export type NextPageInitRequest = z.infer<typeof NextPageInitSchema>;

/**
 * 仮登録完了 initRequest
 */
export type NextPageDecrypt = {
  /** メールアドレス */
  id: number;
};
