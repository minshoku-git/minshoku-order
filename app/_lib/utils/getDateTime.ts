import { format, startOfMonth, subDays, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { toZonedTime } from 'date-fns-tz';

/**
 * getDateTime.tsx
 * 日時に関わる関数を管理します。
 */

const JST_TIMEZONE = 'Asia/Tokyo';

/**
 * getNow
 * 純粋な現在時刻（UTC）を返します。比較用に使用します。
 */
export function getNow(): Date {
  return new Date();
}

/**
 * getJstNow
 * 日本時間での現在時刻を取得します。
 */
export function getJstNow(): Date {
  return toZonedTime(new Date(), JST_TIMEZONE);
}

/**
 * getTodayXHour
 * 日本時間での「今日」の指定時刻（H時0分0秒）をUTC Dateとして取得します。
 */
export function getTodayXHour(H: number = 0): Date {
  const jstNow = getJstNow();
  const dateStr = format(jstNow, 'yyyy-MM-dd');
  // 日本時間の "YYYY-MM-DDTHH:00:00" をUTCとして解釈させる
  return toZonedTime(`${dateStr}T${String(H).padStart(2, '0')}:00:00`, JST_TIMEZONE);
}

/**
 * getTomorrow
 * 日本時間基準での「明日」の0時を取得します。
 */
export function getTomorrow(): Date {
  const jstNow = getJstNow();
  const tomorrow = new Date(jstNow);
  tomorrow.setDate(jstNow.getDate() + 1);
  const dateStr = format(tomorrow, 'yyyy-MM-dd');
  return toZonedTime(`${dateStr}T00:00:00`, JST_TIMEZONE);
}

/**
 * getYesterday
 * 日本時間基準での「昨日」の0時を取得します。
 */
export function getYesterday(): Date {
  const jstNow = getJstNow();
  const yesterday = new Date(jstNow);
  yesterday.setDate(jstNow.getDate() - 1);
  const dateStr = format(yesterday, 'yyyy-MM-dd');
  return toZonedTime(`${dateStr}T00:00:00`, JST_TIMEZONE);
}

/**
 * 今月1日の取得
 */
export function getThisMonthStartDay(): Date {
  const jstNow = getJstNow();
  return startOfMonth(jstNow);
}

/**
 * 先月1日の取得
 */
export function getLastMonthStartDay(): Date {
  const startDay = getThisMonthStartDay();
  return subMonths(startDay, 1);
}

/**
 * 先月最終日の取得
 */
export function getLastMonthEndDay(): Date {
  const startDay = getThisMonthStartDay();
  return subDays(startDay, 1);
}

/**
 * formatTimeToJst
 * UTCの時刻文字列('HH:mm:ss')を日本時間の文字列('HH:mm')に変換します。
 */
export function formatTimeToJst(timeStr: string | null | undefined): string {
  if (!timeStr) return '';
  // 基準日を固定して時刻を結合し、JSTとして解釈してからフォーマットする
  const dummyDate = '2000-01-01';
  const jstDate = toZonedTime(`${dummyDate}T${timeStr.slice(0, 8)}`, JST_TIMEZONE);
  return format(jstDate, 'HH:mm');
}

/**
 * formatJstDate
 * Dateを日本時間の'yyyy年M月d日(E)'に変換します。
 */
export function formatJstDate(utcDate: Date | string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  const jstDate = toZonedTime(date, JST_TIMEZONE);
  return format(jstDate, 'yyyy年M月d日(E)', { locale: ja });
}

/**
 * formatJstDateTime
 * Dateを日本時間の'yyyy年M月d日(E) HH:mm:ss'に変換します。
 */
export function formatJstDateTime(utcDate: Date | string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  const jstDate = toZonedTime(date, JST_TIMEZONE);
  return format(jstDate, 'yyyy年M月d日(E) HH:mm:ss', { locale: ja });
}

/**
 * getCancelDeadlineUTC
 * 納品日から日本時間基準のキャンセル期限（UTC Date）を計算します。
 */
export function getCancelDeadlineUTC(
  deliveryDay: Date | string,
  cancelDaysBefore: number,
  cancelTime: string
): Date {
  // 納品日を "YYYY-MM-DD" 形式で取得
  const d = typeof deliveryDay === 'string' ? deliveryDay.split('T')[0] : format(toZonedTime(deliveryDay, JST_TIMEZONE), 'yyyy-MM-dd');
  const deliveryDateJst = toZonedTime(`${d}T00:00:00`, JST_TIMEZONE);

  // 日本時間基準で日数を引く
  const deadlineJst = subDays(deliveryDateJst, cancelDaysBefore);
  const deadlineDateStr = format(deadlineJst, 'yyyy-MM-dd');

  // 日本時間の指定時刻でDateを生成（自動的にUTCに変換される）
  return toZonedTime(`${deadlineDateStr}T${cancelTime.slice(0, 8)}`, JST_TIMEZONE);
}

/**
 * getOrderDeadlineUTC
 * 提供日を基に日本時間基準の注文期限（UTC Date）を計算します。
 */
export function getOrderDeadlineUTC(
  deliveryDay: Date | string,
  orderPeriodDaysBefore: number,
  orderPeriodTime: string 
): Date {
  const d = typeof deliveryDay === 'string' ? deliveryDay.split('T')[0] : format(toZonedTime(deliveryDay, JST_TIMEZONE), 'yyyy-MM-dd');
  const deliveryDateJst = toZonedTime(`${d}T00:00:00`, JST_TIMEZONE);

  const deadlineJst = subDays(deliveryDateJst, orderPeriodDaysBefore);
  const deadlineDateStr = format(deadlineJst, 'yyyy-MM-dd');

  return toZonedTime(`${deadlineDateStr}T${orderPeriodTime.slice(0, 8)}`, JST_TIMEZONE);
}