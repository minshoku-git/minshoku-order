// app/_lib/utils/getDateTime.tsx

import { format, startOfMonth, subDays, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

/**
 * getDateTime.tsx
 * 日時に関わる関数を管理します。
 */

const JST_TIMEZONE = 'Asia/Tokyo';

/**
 * getNow
 * 純粋な現在時刻（UTC）を返します。判定の基準に使用します。
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
 * getCancelDeadlineUTC / getOrderDeadlineUTC
 * 納品日の「日付」から日本時間基準の期限（UTC Date）を正確に算出します。
 */
export function getCancelDeadlineUTC(
  deliveryDay: Date | string,
  cancelDaysBefore: number,
  cancelTime: string
): Date {
  // 1. deliveryDay が timestamp with time zone (UTC) のため、一度日本時間の文字列 "YYYY-MM-DD" に直す
  // これにより、DBの値が 00:00:00+00 (JST 09:00) であっても、正しい「日付」を取り出せる
  const dateStr = typeof deliveryDay === 'string' 
    ? deliveryDay.split('T')[0] 
    : format(toZonedTime(deliveryDay, JST_TIMEZONE), 'yyyy-MM-dd');

  // 2. 日本時間での「納品日0時」を起点にする
  const deliveryDateJst = fromZonedTime(`${dateStr}T00:00:00`, JST_TIMEZONE);

  // 3. 日本時間基準で日数を引く
  const deadlineJst = subDays(deliveryDateJst, cancelDaysBefore);
  const deadlineDateStr = format(deadlineJst, 'yyyy-MM-dd');

  // 4. fromZonedTime を使い、日本の指定時刻を正しい UTC に変換する
  // 例: "2026-05-25T17:00:00" (JST) -> 正しく "08:00:00" (UTC) に変換される
  return fromZonedTime(`${deadlineDateStr}T${cancelTime.slice(0, 8)}`, JST_TIMEZONE);
}

export function getOrderDeadlineUTC(
  deliveryDay: Date | string,
  orderPeriodDaysBefore: number,
  orderPeriodTime: string 
): Date {
  const dateStr = typeof deliveryDay === 'string' 
    ? deliveryDay.split('T')[0] 
    : format(toZonedTime(deliveryDay, JST_TIMEZONE), 'yyyy-MM-dd');

  const deliveryDateJst = fromZonedTime(`${dateStr}T00:00:00`, JST_TIMEZONE);
  const deadlineJst = subDays(deliveryDateJst, orderPeriodDaysBefore);
  const deadlineDateStr = format(deadlineJst, 'yyyy-MM-dd');

  return fromZonedTime(`${deadlineDateStr}T${orderPeriodTime.slice(0, 8)}`, JST_TIMEZONE);
}

/**
 * 表示用変換 (UTC -> JST文字列)
 */
export function formatTimeToJst(timeStr: string | null | undefined): string {
  if (!timeStr) return '';
  const dummyDate = '2000-01-01';
  const utcDate = new Date(`${dummyDate}T${timeStr.slice(0, 8)}Z`);
  return format(toZonedTime(utcDate, JST_TIMEZONE), 'HH:mm');
}

export function formatJstDate(utcDate: Date | string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  return format(toZonedTime(date, JST_TIMEZONE), 'yyyy年M月d日(E)', { locale: ja });
}

export function formatJstDateTime(utcDate: Date | string): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  return format(toZonedTime(date, JST_TIMEZONE), 'yyyy年M月d日(E) HH:mm:ss', { locale: ja });
}

/**
 * getTodayXHour
 */
export function getTodayXHour(H: number = 0): Date {
  const dateStr = format(getJstNow(), 'yyyy-MM-dd');
  return fromZonedTime(`${dateStr}T${String(H).padStart(2, '0')}:00:00`, JST_TIMEZONE);
}