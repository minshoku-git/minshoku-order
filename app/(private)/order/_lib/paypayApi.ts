'use server';

/**
 * PayPay(コード決済)API
 *
 * GMO Payment Gateway・プロトコルタイプ(idPass)。クレジットカードと同じ加盟店契約
 * (ShopID/ShopPass)を使い、SiteID/SitePassは使用しない(会員登録の概念が無いため)。
 *
 * 参照: https://docs.gmo-pg.com/mulpay/docs/payment-method/wallet/paypay/onetime/api-list
 *
 * 都度決済(即時売上)のフロー:
 *   1. entryTranPaypay  … 取引登録 (EntryTranPaypay.idPass)
 *   2. execTranPaypay   … 決済実行 (ExecTranPaypay.idPass)。StartURL/Tokenを取得
 *   3. クライアント側でStartURLへ AccessID+Token を隠しフォームでPOST送信し、
 *      ユーザーをPayPayログイン画面へ遷移させる(PaypayStart.idPass、ブラウザから直接POSTする
 *      ため、このファイルにサーバー関数は無い)
 *   4. 決済完了後、GMOが ExecTranPaypay で指定した RetURL へ結果をPOSTしてくる
 *      (複数回届く可能性・届かない可能性があるため、真の結果は searchTradePaypay で確認する)
 */

/**
 * ① 取引登録 (EntryTranPaypay)
 * 決済の枠を作成し、AccessID/AccessPassを取得します。
 */
export const entryTranPaypay = async (orderId: string, amount: number, shopId: string, shopPass: string) => {
  const baseUrl = process.env.GMO_BASE_URL!;

  const params = new URLSearchParams();
  params.append('ShopID', shopId);
  params.append('ShopPass', shopPass);
  params.append('OrderID', orderId);
  params.append('Amount', String(amount));
  params.append('JobCd', 'CAPTURE'); // 即時売上

  try {
    const response = await fetch(`${baseUrl}/payment/EntryTranPaypay.idPass`, {
      method: 'POST',
      body: params,
    });
    const text = new TextDecoder('shift-jis').decode(await response.arrayBuffer());
    const resParams = new URLSearchParams(text);

    return {
      success: !resParams.get('ErrCode'),
      accessId: resParams.get('AccessID'),
      accessPass: resParams.get('AccessPass'),
      errInfo: resParams.get('ErrInfo'),
    };
  } catch (e) {
    return { success: false, errInfo: 'CONNECTION_ERROR' };
  }
};

/**
 * ② 決済実行 (ExecTranPaypay)
 * ユーザーをPayPayログイン画面へ遷移させるための StartURL/Token を取得します。
 * クレジットカードのExecTranと異なり、ShopID/ShopPassの再指定が必須(GMOテスト環境で実疎通確認済み。
 * 未指定だとM01002001/M01003001エラーになる)。
 * @param {string} retUrl - 決済結果をGMOがPOSTで返してくる戻りURL(RetURL)
 */
export const execTranPaypay = async (
  accessId: string,
  accessPass: string,
  orderId: string,
  retUrl: string,
  shopId: string,
  shopPass: string
) => {
  const baseUrl = process.env.GMO_BASE_URL!;

  const params = new URLSearchParams();
  params.append('ShopID', shopId);
  params.append('ShopPass', shopPass);
  params.append('AccessID', accessId);
  params.append('AccessPass', accessPass);
  params.append('OrderID', orderId);
  params.append('RetURL', retUrl);

  try {
    const response = await fetch(`${baseUrl}/payment/ExecTranPaypay.idPass`, {
      method: 'POST',
      body: params,
    });
    const text = new TextDecoder('shift-jis').decode(await response.arrayBuffer());
    const resParams = new URLSearchParams(text);

    return {
      success: !resParams.get('ErrCode'),
      // GMOテスト環境での実疎通で確認済み(StartURL/Token)。StartLimitDate(StartURLの有効期限)も返るが未使用。
      startUrl: resParams.get('StartURL'),
      token: resParams.get('Token'),
      errInfo: resParams.get('ErrInfo'),
    };
  } catch (e) {
    return { success: false, errInfo: 'CONNECTION_ERROR' };
  }
};

/**
 * ③ キャンセル・返金 (PaypayCancelReturn)
 * 仮売上のキャンセル、実売上の返金の両方をこのAPIで行う。
 * クレジットカードのAlterTran(JobCd=VOID)とは異なり、JobCdは使わず、
 * OrderIDと取消/返金する金額(CancelAmount)を指定する方式であることを
 * GMOテスト環境での実疎通で確認済み(全額指定で実売上の全額返金に成功、Status=RETURNが返る)。
 */
export const paypayCancelReturn = async (
  accessId: string,
  accessPass: string,
  shopId: string,
  shopPass: string,
  orderId: string,
  amount: number
) => {
  const baseUrl = process.env.GMO_BASE_URL!;

  const params = new URLSearchParams();
  params.append('ShopID', shopId);
  params.append('ShopPass', shopPass);
  params.append('OrderID', orderId);
  params.append('AccessID', accessId);
  params.append('AccessPass', accessPass);
  params.append('CancelAmount', String(amount));
  params.append('CancelTax', '0');

  try {
    const response = await fetch(`${baseUrl}/payment/PaypayCancelReturn.idPass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const text = new TextDecoder('shift-jis').decode(await response.arrayBuffer());
    const resParams = new URLSearchParams(text);

    if (resParams.get('ErrCode')) {
      console.error('[paypayCancelReturn] Error:', resParams.get('ErrInfo'));
      return { success: false, errInfo: resParams.get('ErrInfo') };
    }

    return { success: true };
  } catch (e) {
    console.error('[paypayCancelReturn] Connection Error:', e);
    return { success: false, errInfo: 'CONNECTION_ERROR' };
  }
};

/**
 * ④ 取引状態参照 (SearchTradeMulti)
 * コールバック(RetURL)を信用せず、サーバー間で決済結果の真偽を確認するための照会API。
 * PayType=45(PayPay)であることをGMOテスト環境での実疎通で確認済み。
 * 成功時は Status=CAPTURE が返る(仮売上/実売上運用の場合は AUTH → CAPTURE のように遷移する想定。未検証)。
 */
export const searchTradePaypay = async (shopId: string, shopPass: string, orderId: string) => {
  const baseUrl = process.env.GMO_BASE_URL!;
  const PAYPAY_PAY_TYPE = '45';

  const params = new URLSearchParams();
  params.append('ShopID', shopId);
  params.append('ShopPass', shopPass);
  params.append('OrderID', orderId);
  params.append('PayType', PAYPAY_PAY_TYPE);

  try {
    const response = await fetch(`${baseUrl}/payment/SearchTradeMulti.idPass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const text = new TextDecoder('shift-jis').decode(await response.arrayBuffer());
    const resParams = new URLSearchParams(text);

    if (resParams.get('ErrCode')) {
      return { success: false, errInfo: resParams.get('ErrInfo') };
    }

    return {
      success: true,
      // GMOテスト環境での実疎通で確認済み: 即時売上完了時は Status=CAPTURE。
      status: resParams.get('Status'),
    };
  } catch (e) {
    return { success: false, errInfo: 'CONNECTION_ERROR' };
  }
};
