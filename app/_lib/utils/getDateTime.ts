import { format, startOfMonth, subDays, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { toZonedTime, format as formatTz } from 'date-fns-tz';

const JST_TIMEZONE = 'Asia/Tokyo';

/**
 * 日本時間の現在日時を取得する (Dateオブジェクト)
 */
export function getNow(): Date {
  return new Date(); // 比較用には純粋なUTC Dateを返します
}

/**
 * 日本時間での「今日」の指定時刻を取得する
 */
export function getTodayXHour(H: number = 0): Date {
  const jstNow = toZonedTime(new Date(), JST_TIMEZONE);
  // 日本のカレンダーの日付でDateを生成し、JSTとして解釈させる
  const dateStr = format(jstNow, 'yyyy-MM-dd');
  return toZonedTime(`${dateStr}T${String(H).padStart(2, '0')}:00:00`, JST_TIMEZONE);
}

/**
 * 納品日からキャンセル日時を UTC として取得します
 */
export function getCancelDeadlineUTC(
  deliveryDay: Date | string,
  cancelDaysBefore: number,
  cancelTime: string // 例: "23:00:00"
): Date {
  // 1. 納品日を日本時間の 00:00 ととして解釈する
  const d = typeof deliveryDay === 'string' ? deliveryDay.split('T')[0] : format(deliveryDay, 'yyyy-MM-dd');
  const jstDeliveryDay = toZonedTime(`${d}T00:00:00`, JST_TIMEZONE);

  // 2. 日本のカレンダー基準で「X日前」を計算
  const deadlineJstDate = subDays(jstDeliveryDay, cancelDaysBefore);
  const dateStr = format(deadlineJstDate, 'yyyy-MM-dd');

  // 3. 日本時間の時刻を結合し、最終的な期限 Date (UTC) を生成
  // "2026-05-26T23:00:00" を Asia/Tokyo として解釈することで、正しいUTC Dateが得られます
  return toZonedTime(`${dateStr}T${cancelTime.slice(0, 8)}`, JST_TIMEZONE);
}

/**
 * 提供日を基に注文の期限日時を取得します
 */
export function getOrderDeadlineUTC(
  deliveryDay: Date | string,
  orderPeriodDaysBefore: number,
  orderPeriodTime: string
): Date {
  const d = typeof deliveryDay === 'string' ? deliveryDay.split('T')[0] : format(deliveryDay, 'yyyy-MM-dd');
  const jstDeliveryDay = toZonedTime(`${d}T00:00:00`, JST_TIMEZONE);

  const deadlineJstDate = subDays(jstDeliveryDay, orderPeriodDaysBefore);
  const dateStr = format(deadlineJstDate, 'yyyy-MM-dd');

  return toZonedTime(`${dateStr}T${orderPeriodTime.slice(0, 8)}`, JST_TIMEZONE);
}

/**
 * UTCを日本時間の表示用文字列に変換
 */
export function formatJstDate(utcDate: Date): string {
  const jstDate = toZonedTime(utcDate, JST_TIMEZONE);
  return format(jstDate, 'yyyy年M月d日(E)', { locale: ja });
}

// 他のフォーマット関数も同様に toZonedTime を使用
export function formatTimeToJst(timeStr: string | null | undefined): string {
  if (!timeStr) return '';
  // DBの time (14:00) を UTCとして扱い、JST(23:00) に変換
  const today = format(new Date(), 'yyyy-MM-dd');
  const utcDate = new Date(`${today}T${timeStr}Z`); 
  const jstDate = toZonedTime(utcDate, JST_TIMEZONE);
  return format(jstDate, 'HH:mm');
}