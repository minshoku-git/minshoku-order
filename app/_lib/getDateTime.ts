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
  const utfDate = new Date();
  return toZonedTime(utfDate, 'Asia/Tokyo');
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
 * 納品日からキャンセル日時を取得します
 * @param jstDate - 日付
 * @returns {Date}
 */
export function getCancelDeadlineUTC(
  deliveryDay: Date | string,
  cancelDaysBefore: number,
  cancelTime: string // 例: "10:30:00"
): Date {
  const newDeliveryDay = new Date(deliveryDay);

  // 納品日（UTC）から、キャンセル可能日数を引いた日付を計算
  const cancelDeadlineUTC = new Date(
    newDeliveryDay.getUTCFullYear(),
    newDeliveryDay.getUTCMonth(),
    newDeliveryDay.getUTCDate() - cancelDaysBefore
  );

  // 指定されたJSTの時刻情報を取得
  const [hourStr, minuteStr] = cancelTime.split(':');
  const jstHour = Number(hourStr);
  const minute = Number(minuteStr);

  // UTCへのタイムゾーン変換
  // JSTはUTC+9なので、9時間引いてUTC時刻をセットする
  cancelDeadlineUTC.setUTCHours(jstHour - 9, minute, 0, 0);

  return cancelDeadlineUTC;
}
