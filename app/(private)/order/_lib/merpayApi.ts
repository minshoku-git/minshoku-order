'use server';

/**
 * メルペイ(コード決済)API
 *
 * GMO Payment Gateway・プロトコルタイプ(idPass)。PayPay(paypayApi.ts)と同じ加盟店契約
 * (ShopID/ShopPass)を使う想定。
 *
 * 参照: https://docs.gmo-pg.com/mulpay/docs/payment-method/wallet/merpay/flow-protocol
 *
 * ⚠ 本ファイルはGMOの公開ドキュメントで確認できた範囲(EntryTranMerpay/ExecTranMerpayという
 * API名、ExecTranMerpayがRetURLに加えてItemCategoryId+StoreID/StoreNameを要求すること)と、
 * PayPay実装(paypayApi.ts)で確立したパターンを踏襲した最良推定で実装している。
 * GMOテスト環境の加盟店コンソールでメルペイが有効化されておらず、本セッションでは実疎通確認が
 * できていないため、以下は未検証:
 *   - EntryTranMerpay/ExecTranMerpayの正確なレスポンス項目名(StartURL/Token相当の名称)
 *   - キャンセル・返金APIの正式名称(MerpayCancelReturn.idPassと仮定)
 *   - 取引状態照会APIの正式名称・PayType値(SearchTradeMulti.idPassの流用と仮定)
 * GMOテスト環境でメルペイが有効化され次第、PayPayの時と同じ手順(直接fetchでの逐次疎通確認)で
 * 確定させること。
 *
 * 都度決済(即時売上)のフロー:
 *   1. entryTranMerpay … 取引登録 (EntryTranMerpay.idPass)
 *   2. execTranMerpay  … 決済実行 (ExecTranMerpay.idPass)。StartURL/Tokenを取得(想定)
 *   3. クライアント側でStartURLへ AccessID+Token を隠しフォームでPOST送信し、
 *      ユーザーをメルカリアプリ/メルペイ画面へ遷移させる(MerpayStart.idPass、ブラウザから
 *      直接POSTするため、このファイルにサーバー関数は無い)
 *   4. 決済完了後、GMOが ExecTranMerpay で指定した RetURL へ結果を返す
 *      (真の結果は searchTradeMerpay で確認する)
 */

import { MERPAY_ITEM_CATEGORY_ID } from '@/app/_config/constants';

/**
 * ① 取引登録 (EntryTranMerpay)
 * 決済の枠を作成し、AccessID/AccessPassを取得します。
 */
export const entryTranMerpay = async (orderId: string, amount: number, shopId: string, shopPass: string) => {
  const baseUrl = process.env.GMO_BASE_URL!;

  const params = new URLSearchParams();
  params.append('ShopID', shopId);
  params.append('ShopPass', shopPass);
  params.append('OrderID', orderId);
  params.append('Amount', String(amount));
  params.append('JobCd', 'CAPTURE'); // 即時売上

  try {
    const response = await fetch(`${baseUrl}/payment/EntryTranMerpay.idPass`, {
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
 * ② 決済実行 (ExecTranMerpay)
 * ユーザーをメルペイ決済画面へ遷移させるための StartURL/Token を取得します。
 * PayPayのExecTranPaypayと異なり、RetURLに加えてItemCategoryId(商品カテゴリID)が必須。
 *
 * GMOテスト環境での実疎通確認の結果:
 * - GMO公開ドキュメントは「単一店舗の場合はStoreID/StoreNameも必須」としていたが、
 *   実際にはItemCategoryIdのみで成功する(StoreID/StoreName無しでもエラーにならない)。
 * - StoreID/StoreNameを付与する場合、StoreNameに日本語(UTF-8)を含めるとM01872013エラーになる
 *   (GMO側がShift-JISバイト列を期待していると推測される。本リポジトリにShift-JISエンコード
 *   ライブラリが無いため、実店舗名をそのまま渡すのは現状避け、StoreID/StoreName自体を送らない
 *   実装にしている)。
 * @param {string} retUrl - 決済結果をGMOがPOSTで返してくる戻りURL(RetURL)
 */
export const execTranMerpay = async (
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
  // GMOテスト環境での実疎通確認済み: 1010(GMOの商品カテゴリ一覧上は「レディースファッション」系だが
  // 値の受理自体は確認済み)。食品/飲食系のより適切なコードがあるか、GMOサポートに要確認。
  params.append('ItemCategoryId', MERPAY_ITEM_CATEGORY_ID);

  try {
    const response = await fetch(`${baseUrl}/payment/ExecTranMerpay.idPass`, {
      method: 'POST',
      body: params,
    });
    const text = new TextDecoder('shift-jis').decode(await response.arrayBuffer());
    const resParams = new URLSearchParams(text);

    return {
      success: !resParams.get('ErrCode'),
      // PayPay(ExecTranPaypay)と同名でStartURL/Tokenが返ることをGMOテスト環境での実疎通で確認済み。
      startUrl: resParams.get('StartURL'),
      token: resParams.get('Token'),
      errInfo: resParams.get('ErrInfo'),
    };
  } catch (e) {
    return { success: false, errInfo: 'CONNECTION_ERROR' };
  }
};

/**
 * ③ キャンセル・返金 (MerpayCancelReturn)
 * PayPayの PaypayCancelReturn.idPass とはパラメータ形が異なることをGMOテスト環境での実疎通で
 * 確認済み: 金額は `CancelAmount`/`CancelTax` ではなく `Amount`/`Tax`。
 * さらに `searchTradeMerpay`(SearchTradeMulti, PayType=43)で事前に取得した
 * `MerpayInquiryCode` の指定が必須(無いとM01005001/M01007001/M01008001の複合エラーになる)。
 * AccessID/AccessPassは entryTranMerpay 時点のものをそのまま使ってよい(実疎通確認済み)。
 * @param {string} merpayInquiryCode - searchTradeMerpayのレスポンスに含まれる`MerpayInquiryCode`
 */
export const merpayCancelReturn = async (
  accessId: string,
  accessPass: string,
  shopId: string,
  shopPass: string,
  orderId: string,
  amount: number,
  merpayInquiryCode: string
) => {
  const baseUrl = process.env.GMO_BASE_URL!;

  const params = new URLSearchParams();
  params.append('ShopID', shopId);
  params.append('ShopPass', shopPass);
  params.append('OrderID', orderId);
  params.append('AccessID', accessId);
  params.append('AccessPass', accessPass);
  params.append('MerpayInquiryCode', merpayInquiryCode);
  params.append('Amount', String(amount));
  params.append('Tax', '0');

  try {
    const response = await fetch(`${baseUrl}/payment/MerpayCancelReturn.idPass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const text = new TextDecoder('shift-jis').decode(await response.arrayBuffer());
    const resParams = new URLSearchParams(text);

    if (resParams.get('ErrCode')) {
      console.error('[merpayCancelReturn] Error:', resParams.get('ErrInfo'));
      return { success: false, errInfo: resParams.get('ErrInfo') };
    }

    return { success: true };
  } catch (e) {
    console.error('[merpayCancelReturn] Connection Error:', e);
    return { success: false, errInfo: 'CONNECTION_ERROR' };
  }
};

/**
 * ④ 取引状態参照 (SearchTradeMulti流用)
 * コールバック(RetURL)を信用せず、サーバー間で決済結果の真偽を確認するための照会API。
 * PayType=43がメルペイであることをGMOテスト環境での実疎通で確認済み(PayPayは45)。
 * 成功時はStatus=CAPTUREが返る(即時売上運用で実疎通確認済み)。
 */
export const searchTradeMerpay = async (shopId: string, shopPass: string, orderId: string) => {
  const baseUrl = process.env.GMO_BASE_URL!;
  const MERPAY_PAY_TYPE = '43';

  const params = new URLSearchParams();
  params.append('ShopID', shopId);
  params.append('ShopPass', shopPass);
  params.append('OrderID', orderId);
  params.append('PayType', MERPAY_PAY_TYPE);

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
      status: resParams.get('Status'),
      // merpayCancelReturnの呼び出しに必須(GMOテスト環境での実疎通で確認済み)
      merpayInquiryCode: resParams.get('MerpayInquiryCode'),
    };
  } catch (e) {
    return { success: false, errInfo: 'CONNECTION_ERROR' };
  }
};
