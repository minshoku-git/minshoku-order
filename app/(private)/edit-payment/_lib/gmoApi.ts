'use server';

import { SaveCardResponse, CreditCardData } from './types';

/**
 * GMOのエラーコードを解析して日本語メッセージを返すヘルパー
 */
const logGmoErrorReason = (context: string, errCode: string | null, errInfo: string | null) => {
  if (!errCode || !errInfo) return;
  const errorMap: Record<string, string> = {
    E01230009: 'カード番号の形式が正しくありません。',
    E01240002: '有効期限の形式が正しくありません（YYMM）。',
    E01040001: '既に登録されている会員IDです。',
    E01390010: '既に登録されている会員IDです。',
    EX1000301: 'トークンが無効または期限切れです。再度お試しください。',
  };
  const reason = errorMap[errInfo] || '未知のエラー（GMO管理画面の設定を確認してください）';
  console.error(`[${context}] ${errCode}: ${errInfo} - ${reason}`);
};

/**
 * ① GMO会員登録 (SaveMember)
 */
export const saveGmoMember = async (memberId: string) => {
  const baseUrl = 'https://pt01.mul-pay.jp'; // ★pt01に統一
  const siteId = 'tsite00060950';
  const sitePass = '2sk628ed';

  const mid = memberId.replace(/[\r\n\t]/g, '').trim();
  const params = new URLSearchParams();
  params.append('SiteID', siteId);
  params.append('SitePass', sitePass);
  params.append('MemberID', mid); // ★引数を使うように修正
  console.log(`MemberIDZZZZZZZZZZZZZZZZZZZZZZZZZZZZ: ${mid} `);

  try {
    const response = await fetch(`${baseUrl}/payment/SaveMember.idPass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const responseText = new TextDecoder('shift-jis').decode(await response.arrayBuffer());
    const resParams = new URLSearchParams(responseText);
    
    if (resParams.get('ErrCode')) {
      const errInfo = resParams.get('ErrInfo');
      if (errInfo === 'E01040001' || errInfo === 'E01390010') return { success: true, alreadyExists: true, memberId: mid };
      return { success: false, errCode: resParams.get('ErrCode'), errInfo };
    }
    return { success: true, memberId: mid, alreadyExists: false };
  } catch (error) {
    return { success: false, message: '通信エラー' };
  }
};

/**
 * ② カード登録/更新 (SaveCard)
 */
export const saveGmoCard = async (memberId: string, token: string): Promise<SaveCardResponse> => {
  const baseUrl = 'https://pt01.mul-pay.jp'; // ★pt01に統一
  const siteId = 'tsite00060950';
  const sitePass = '2sk628ed';


  console.log(`ここかなああああああああああああああああああああ: ${token} `);

  const params = new URLSearchParams();
  params.append('SiteID', siteId);
  params.append('SitePass', sitePass);
  params.append('MemberID', memberId.trim());
  params.append('Token', token.trim()); // ★トークンを送信
  params.append('SeqMode', '0'); // 複数登録の場合はここを1にする（今回は0でOK）

  try {
    const response = await fetch(`${baseUrl}/payment/SaveCard.idPass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const responseText = new TextDecoder('shift-jis').decode(await response.arrayBuffer());
    const resParams = new URLSearchParams(responseText);

    if (resParams.get('ErrCode')) {
      logGmoErrorReason('saveGmoCard', resParams.get('ErrCode'), resParams.get('ErrInfo'));
      return { ErrCode: resParams.get('ErrCode')!, ErrInfo: resParams.get('ErrInfo')! };
    }

    return { CardSeq: resParams.get('CardSeq')!, CardNo: resParams.get('CardNo')! };
  } catch (error) {
    return { ErrCode: 'SYSTEM', ErrInfo: 'FETCH_ERROR' };
  }
};

/**
 * ③ 登録済みカードの検索 (SearchCard)
 */
export const searchGmoCards = async (memberId: string): Promise<CreditCardData[]> => {
  const baseUrl = 'https://pt01.mul-pay.jp'; // ★pt01に統一
  const siteId = 'tsite00060950';
  const sitePass = '2sk628ed';

  const params = new URLSearchParams();
  params.append('SiteID', siteId);
  params.append('SitePass', sitePass);
  params.append('MemberID', memberId);
  params.append('SeqMode', '0');

  try {
    const response = await fetch(`${baseUrl}/payment/SearchCard.idPass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const responseText = new TextDecoder('shift-jis').decode(await response.arrayBuffer());
    const resParams = new URLSearchParams(responseText);

    if (resParams.get('ErrCode')) return [];

    const seqs = resParams.get('CardSeq')?.split('|') || [];
    const numbers = resParams.get('CardNo')?.split('|') || [];

    return seqs.map((seq, i) => ({
      creditcardId: seq,
      maskedCardNumber: numbers[i]
    }));
  } catch (error) {
    return [];
  }
};