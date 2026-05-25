import { format, startOfMonth, subDays, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { toZonedTime } from 'date-fns-tz';

const JST_TIMEZONE = 'Asia/Tokyo';

/**
 * 現在日時の取得 (UTC)
 */
export function getNow(): Date {
  return new Date();
}

/**
 * 日本時間での現在時刻を取得
 */
export function getJstNow(): Date {
  return toZonedTime(new Date(), JST_TIMEZONE);
}

/**
 * getCancelDeadlineUTC / getOrderDeadlineUTC
 * DBの時刻(UTC)をそのまま UTC Date として生成し、期限を算出します。
 */
export function getCancelDeadlineUTC(
  deliveryDay: Date | string,
  cancelDaysBefore: number,
  cancelTime: string // DBの値 "10:00:00" (UTC)
): Date {
  // 1. 納品日から日付部分のみ取得 ("2026-05-27")
  const dateStr = typeof deliveryDay === 'string' 
    ? deliveryDay.split('T')[0] 
    : format(deliveryDay, 'yyyy-MM-dd');

  // 2. DBの時刻を UTC として解釈した Date を作成
  const deadlineUTC = new Date(`${dateStr}T${cancelTime.slice(0, 8)}Z`);

  // 3. 設定された日数を引く (UTC基準)
  deadlineUTC.setUTCDate(deadlineUTC.getUTCDate() - cancelDaysBefore);

  return deadlineUTC;
}

export function getOrderDeadlineUTC(
  deliveryDay: Date | string,
  orderPeriodDaysBefore: number,
  orderPeriodTime: string 
): Date {
  const dateStr = typeof deliveryDay === 'string' 
    ? deliveryDay.split('T')[0] 
    : format(deliveryDay, 'yyyy-MM-dd');

  const deadlineUTC = new Date(`${dateStr}T${orderPeriodTime.slice(0, 8)}Z`);
  deadlineUTC.setUTCDate(deadlineUTC.getUTCDate() - orderPeriodDaysBefore);

  return deadlineUTC;
}

/**
 * 表示用：UTCの時刻文字列('HH:mm:ss')を日本時間の文字列('HH:mm')に変換
 * 例: "10:00:00" -> "19:00"
 */
export function formatTimeToJst(timeStr: string | null | undefined): string {
  if (!timeStr) return '';
  const dummyDate = '2000-01-01';
  // "Z" を付与して UTC として読み込み、JST に変換して表示
  const utcDate = new Date(`${dummyDate}T${timeStr.slice(0, 8)}Z`);
  const jstDate = toZonedTime(utcDate, JST_TIMEZONE);
  return format(jstDate, 'HH:mm');
}

/**
 * 表示用：Dateを日本時間の形式に変換
 */
export function formatJstDate(utcDate: Date | string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  return format(toZonedTime(date, JST_TIMEZONE), 'yyyy年M月d日(E)', { locale: ja });
}

export function formatJstDateTime(utcDate: Date | string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  return format(toZonedTime(date, JST_TIMEZONE), 'yyyy年M月d日(E) HH:mm:ss', { locale: ja });
}

/**
 * getTodayXHour (日本時間の今日0時などを取得)
 */
export function getTodayXHour(H: number = 0): Date {
  const jstNow = getJstNow();
  const dateStr = format(jstNow, 'yyyy-MM-dd');
  // 日本時間の指定時刻を生成し、Dateオブジェクトにする
  return new Date(`${dateStr}T${String(H).padStart(2, '0')}:00:00+09:00`);
}