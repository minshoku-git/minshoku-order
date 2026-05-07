/**
 * constants.ts
 * 全機能共通で使用する定数を管理します。
 * マジックナンバーは使わないこと！
 */

/**
 * 検索画面の一頁あたりの表示上限件数
 * @returns {number} - 最大表示件数(30件)
 */
export const PAGE_MAX_COUNT: number = 30;

/**
 * 注文履歴画面の一頁あたりの表示上限件数
 * @returns {number} - 最大表示件数(10件/日)
 */
export const ORDER_HISTORY_PAGE_MAX_COUNT: number = 10;

/**
 * 1KBのByte数(1024Byte)
 * @returns {number} - 1024
 */
export const KB_BYTE_SIZE: number = 1024;

/**
 * 署名付きURLの有効期限
 * @returns {number} - 60 * 60 (1時間)
 */
export const EXPIRES_IN_TIME: number = 60 * 60;

/**
 * 添付可能な画像拡張子
 * @returns {Array<string>} - ['image/png', 'image/jpg', 'image/jpeg']
 */
export const IMAGE_TYPES: Array<string> = ['image/png', 'image/jpg', 'image/jpeg'];

/**
 * ハイフン
 * @returns {string} - '-'
 */
export const HYPHEN: string = '-';

/**
 * 仮ID用文字列('temp-')
 * @returns {string} - 'temp-'
 */
export const TEMP_HYPHEN: string = 'temp-';

/**
 * 仮ID用文字列('temp-')
 * @returns {string} - 'temp-'
 */
export const PublicPaths = ['/', '/login', '/error', '/register-payment'];

/* Supabase Storage
------------------------------------------------------------------ */
/**
 * 仮ID用文字列('temp-')
 * @returns {string} - 'shop-images'
 */
export const BUCKET_SHOP_IMAGES: string = 'shop-images';

/* バリデーションメッセージ
------------------------------------------------------------------ */
export const MSG_REQUIRED = '{0}は必須入力です。';
export const MSG_INVALID = '{0}を正しく入力してください。';
export const MSG_MAX = '{0}は{1}文字以内で入力してください。';
export const MSG_MIN_TO_MAX = '{0}は{1}文字から{2}文字以内で入力してください。';
export const MSG_EMAIL = '{0}は正しく入力してください。';
export const MSG_POSTALCODE = '{0}は半角数字{1}桁を入力してください。';
export const MSG_HANKAKU_NUM = '{0}は半角数字を入力してください。';
export const MSG_HANKAKU_KANA = '{0}は半角カナを入力してください。';
export const MSG_DOMAIN = '有効なドメイン名を入力してください。';
export const MSG_PASSWORD =
  '{0}は大・小文字・数字をすべて1文字以上含む半角英数字、10文字以上15文字未満で入力してください。';
export const MSG_CONFIRM_PASSWORD = '同じパスワードを2回入力してください。';
export const MSG_EMOJI = '{0}に絵文字は使用できません。';
export const MSG_INVALID_FORMAT = '{0}は正しく入力してください。';
export const MSG_HANKAKU_NUM_MIN_TO_MAX_DIGIT = '{0}は半角数字{1}桁から{2}桁で入力してください。';
export const MSG_FORMAT = '{0}は{1}形式で入力してください。';
export const MSG_FURIGANA = '{0}はカタカナで入力してください。';
export const MSG_PASSWORDRULE = 'ルールに準じた{0}を入力してください。';
export const MSG_INCORRECT = '{0}は間違っています。';
export const MSG_ILLEGAL = '{0}は不正です。';
/* 正規表現集
------------------------------------------------------------------ */
export const REG_POSTALCODE = '^[0-9]{7}';
export const REG_HANKAKU_EISU = '/^[a-zA-Z0-9]+$/u';
export const REG_HANKAKU_NUM = '^\\d+$';
export const REG_ZENKAKU_KANA = '^[\u30A0-\u30FF]+$';
export const REG_HANKAKU_KANA = '^[\\uFF66-\\uFF9F]*$';
export const REG_DOMAIN = /^(?=.{1,253}$)(?!\-)(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;
export const REG_PASSWORD = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{8,}$/;
export const REG_CARD_NUMBER = '^[0-9]{14,16}$'; // 半角数字16桁固定（カード番号用）
export const REG_EXPIRY_DATE = '^(0[1-9]|1[0-2])\\/[0-9]{2}$'; // MM/YY形式（有効期限用）
export const REG_SECURITY_CODE = '^[0-9]{3,4}$'; // 半角数字3桁から4桁（セキュリティコード用）
export const REG_FURIGANA = '^[\\u30A0-\\u30FF\\uFF66-\\uFF9F]*$'; // 全角カタカナ([\u30A0-\u30FF]) と 半角カタカナ([\uFF66-\uFF9F]) のみを許容
export const REGEX_EMAIL =
  /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
