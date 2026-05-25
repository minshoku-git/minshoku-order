import { format, formatISO, startOfMonth, subDays, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { toZonedTime } from 'date-fns-tz';

/**
 * getDateTime.tsx
 * 日時に関わる関数を管理します。
 */

/**
 * 現在日時の取得
 * @returns {date} 現在日時
 */
export function getNow(): Date {
  // タイムゾーン変換をせず、純粋な現在時刻（UTC）を返す
  return new Date();
}

/**
 * 現在日のX時取得
 * @returns {date} 現在日0時
 */
export function getTodayXHour(H: number = 0): Date {
  const d = getNow();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), H, 0, 0);
}

/**
 * 明日の取得
 * @returns {date} 日付(明日)
 */
export function getTomorrow(): Date {
  const today = getNow();
  return new Date(today.getFullYear(), today.getMonth(), parseInt(('00' + today.getDate()).slice(-2)) + 1);
}

/**
 * 昨日の取得
 * @returns {date} 日付(昨日)
 */
export function getYesterday(): Date {
  const today = getNow();
  return new Date(today.getFullYear(), today.getMonth(), parseInt(('00' + today.getDate()).slice(-2)) - 1);
}

/**
 * 今月1日の取得
 * @returns {date} 日付(今月1日)
 */
export function getThisMonthStartDay(): Date {
  return startOfMonth(new Date());
}

/**
 * 先月1日の取得
 * @returns {date} 日付(先月1日)
 */
export function getLastMonthStartDay(): Date {
  const startDay = getThisMonthStartDay();
  return subMonths(startDay, +1);
}

/**
 * 先月最終日の取得
 * @returns {date} 日付(先月最終日)
 */
export function getLastMonthEndDay(): Date {
  const startDay = getThisMonthStartDay();
  return subDays(startDay, +1);
}

/**
 * getTimeString
 * Dateから文字列の時間('HH:mm')の取得
 * @param date - 日時
 * @returns {string} 'HH:mm'
 */
export function getTimeString(date: Date): string {
  return format(date, 'HH:mm');
}

/**
 * getTimeString
 * Dateから文字列の日付('yyyy/MM/dd')の取得
 * @param date - 日付
 * @returns {string} 'yyyy/MM/dd'
 */
export function getDateString(date: Date): string {
  return format(date, 'yyyy/MM/dd');
}

/**
 * getDatetimeString
 * Dateから文字列の日付('yyyy/MM/dd HH:mm')の取得
 * @param date - 日付
 * @returns {string} 'yyyy/MM/dd HH:mm'
 */
export function getDatetimeString(date: Date): string {
  return format(date, 'yyyy/MM/dd HH:mm');
}

/**
 * toUTCDateFromJSTDate
 * JSTをUTCに変換します
 * @param jstDate - 日付
 * @returns {string} 'yyyy/MM/dd HH:mm'
 */
export function toUTCDateFromJSTDate(jstDate: Date): Date {
  const utcDate = new Date(jstDate.getTime());
  utcDate.setHours(jstDate.getHours() - 9); // JSTはUTC+9
  return utcDate;
}

/**
 * formatJST
 * UTCを'yyyy年M月d日(E)'に変換します
 * @param jstDate - 日付
 * @returns {string} 'yyyy年M月d日(E)'
 */
export function formatJstDate(utcDate: Date): string {
  const jstDate = toZonedTime(utcDate, 'Asia/Tokyo');
  return format(jstDate, 'yyyy年M月d日(E)', { locale: ja });
}

/**
 * formatJST
 * UTCを'yyyy年M月d日(E)'に変換します
 * @param jstDate - 日付
 * @returns {string} 'yyyy年M月d日(E)'
 */
export function formatJstDateTime(utcDate: Date): string {
  const jstDate = toZonedTime(utcDate, 'Asia/Tokyo');
  return format(jstDate, 'yyyy年M月d日(E) HH:mm:ss', { locale: ja });
}

/**
 * getCancelDeadlineUTC
 * 納品日からキャンセル日時を UTC として取得します
 */
export function getCancelDeadlineUTC(
  deliveryDay: Date | string,
  cancelDaysBefore: number,
  cancelTime: string
): Date {
  const deadlineUTC = new Date(deliveryDay);

  // 日付を「X日前」にずらす
  deadlineUTC.setUTCDate(deadlineUTC.getUTCDate() - cancelDaysBefore);

  const [hourStr, minuteStr] = cancelTime.split(':');
  const jstHour = Number(hourStr);
  const minute = Number(minuteStr);

  // JST(UTC+9) から UTC に変換
  deadlineUTC.setUTCHours(jstHour - 9, minute, 0, 0);

  return deadlineUTC;
}

/**
 * getOrderDeadlineUTC
 * 提供日を基に注文の期限日時を取得します
 * @param deliveryDay - 提供日（納品日）(Date or string)
 * @param orderPeriodDaysBefore - 注文可能な日数（納品日から何日前か）
 * @param orderPeriodTime - 注文時刻（例: "10:30:00"）
 * @returns {Date} - 注文期限日時
 */
export function getOrderDeadlineUTC(
  deliveryDay: Date | string,
  orderPeriodDaysBefore: number,
  orderPeriodTime: string
): Date {
  const deadlineUTC = new Date(deliveryDay);

  // 納品日(UTC)から日数を引く
  deadlineUTC.setUTCDate(deadlineUTC.getUTCDate() - orderPeriodDaysBefore);

  const [hourStr, minuteStr] = orderPeriodTime.split(':');
  const jstHour = Number(hourStr);
  const minute = Number(minuteStr);

  // ★重要：JSTの時間をUTCに変換（9時間引く）
  deadlineUTC.setUTCHours(jstHour - 9, minute, 0, 0);

  return deadlineUTC;
}

/**
 * formatTimeToJst
 * UTCの時刻文字列('HH:mm:ss')を日本時間の文字列('HH:mm')に変換します
 * @param timeStr - UTC時刻文字列 (例: "10:00:00")
 * @returns {string} 'HH:mm' (JST)
 */
export function formatTimeToJst(timeStr: string | null | undefined): string {
  if (!timeStr) return '';

  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // 今日の日付に、DBから届いたUTC時刻をセットしたDateオブジェクトを作成
  const date = new Date();
  date.setUTCHours(hours, minutes, 0, 0);

  // 既存の toZonedTime を使って Asia/Tokyo に変換
  const jstDate = toZonedTime(date, 'Asia/Tokyo');
  
  return format(jstDate, 'HH:mm');
}
