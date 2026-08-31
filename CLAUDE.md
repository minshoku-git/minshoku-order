# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

「みんなの社食」の **エンドユーザー向け注文アプリ**（従業員がログインして日替わりメニューを見て注文・キャンセルし、GMO決済でクレジット決済する）。Next.js 16 App Router + MUI v6 + Supabase。モバイル前提のレイアウト（本文コンテンツは `maxWidth: 640`、`app/_ui/components/layouts/ClientLayoutWrapper.tsx` 参照）。UI文言・コメント・コミットメッセージはすべて日本語。

**姉妹リポジトリ**: `../minshoku` が同じ Supabase DB を参照する **管理画面（社内オペレーター向け）**。店舗・メニュー・企業の登録/編集は管理画面側が行い、このリポジトリは基本的に参照専用。
`app/_lib/supabase/tableTypes.d.ts` は両リポジトリで手動コピー・重複しており、**既に内容が乖離している**。DBスキーマが変わったら両方を更新すること。管理画面側の変更（画像アップロード処理など）がこちらの表示・取得ロジックを壊すことがあるので、原因調査時は `../minshoku` も合わせて確認する（例: commit 9b7d906 — 店舗画像の差し替え順序バグ）。

## Commands

```bash
npm run dev              # next dev --turbopack
npm run build
npm run start             # build後の本番起動確認用

npm run lint              # prettier --check . → next lint（この順で両方通す）
npm run lint:prettier     # prettier --check . のみ
npm run lint:eslint       # next lint のみ
npm run fix                # prettier --write . → eslint --fix
```

テストフレームワークは未導入（Jest/Vitest/Playwright いずれも無し）。動作確認は `npm run lint` / `npm run build` とブラウザでの手動確認で行う。

`app/_scripts/list-eslint-problems.js` というスクリプトファイルが存在するが、`package.json` のどのコマンドからも参照されていない（未配線）。

## デプロイ

`vercel.json` で Git 連携デプロイを無効化し（`"git": { "deploymentEnabled": false }`）、GitHub Actions から Vercel CLI で明示デプロイする構成。

| トリガー                         | ワークフロー                               | 環境       |
| -------------------------------- | ------------------------------------------ | ---------- |
| `main` への push                 | `.github/workflows/vercel-production.yaml` | production |
| `v{n}.{n}.{n}` ブランチへの push | `.github/workflows/vercel-preview.yaml`    | preview    |

本番デプロイ時、実際の環境変数はVercelプロジェクトの環境変数から取得される（ローカルの `.env.local` とは値が異なりうる。下記参照）。

## 環境変数（`.env.local`）

**本番でも `_DEV` サフィックス付きの変数名を参照している**（`SUPABASE_URL_DEV` / `SUPABASE_ANON_DEV` / `SUPABASE_NAME_DEV`）。サフィックスなしの `SUPABASE_URL` / `SUPABASE_ANON` 等も `.env.local` に定義されているが、コード側（`app/_lib/supabase/server.ts`, `app/_lib/supabase/middleware.ts`, `next.config.ts`）は参照していない。新しい変数を足すときはこの既存の命名に合わせる。

その他: `SUPABASE_DB_CONNECTION_STRING`（`pg` 直結・トランザクション用）、`SUPABASE_DB_SCHEMA`（**public ではない**、supabase-js は `db:{schema}`、pg は接続後に `SET search_path TO ...`）、`SUPABASE_STORAGE`（バケット名）、`ENCRYPTION_KEY` / `BUFFER_KEY`（**定義されているだけで未使用** — `app/_lib/encryption/crypto.ts` はハードコードされた鍵/IVを使っている）、`GOOGLE_MAIL_USER` / `GOOGLE_APP_PASSWORD`（Nodemailer）。

**ローカルの `.env.local` の値と本番Vercel環境変数は食い違うことがある**（実例: `SUPABASE_STORAGE` がローカルでは `shop-images` だが本番は `public`）。本番の値を確認する必要がある場合は推測せず `vercel link` → `vercel env pull --environment=production <file>` で取得すること。

**GMO Payment Gateway**（`GMO_BASE_URL` / `GMO_SITE_ID` / `GMO_SITE_PASS` / `NEXT_PUBLIC_GMO_TOKEN_JS_URL`）は、Vercelの Production/Preview で値を出し分けている（`SUPABASE_URL_DEV`/`SUPABASE_STORAGE` と同じ「同じ変数名でVercel環境ごとに値を変える」パターン）。Production=GMO本番（`p01.mul-pay.jp`）、Preview=GMOテスト環境（`pt01.mul-pay.jp`、`v{n}.{n}.{n}`ブランチのデプロイに対応）。ローカルの`.env.local`もPreview/dev Supabaseと対でテスト環境の値にしてある。`app/(private)/order/_lib/gmoApi.ts`・`app/(private)/register-payment/_lib/gmoApi.ts`・`app/(private)/edit-payment/_lib/gmoApi.ts`の3ファイルがこれらを参照する（以前はファイル内にハードコード＋コメントアウトでの手動切り替えだったが環境変数化した）。`ShopID`/`ShopPass`（`t_shops.gmo_shop_code`/`gmo_shop_password`）は元々DB管理なのでこの対象外。

## アーキテクチャ

### 機能単位の垂直スライス

1画面 = 1ディレクトリ。この4点セットを守る。

```
app/(private)/<feature>/            # または app/(public)/<feature>/
├── page.tsx        # Server Component。component.tsx を返すだけの薄いラッパー
├── component.tsx   # 'use client'。画面の実装本体
└── _lib/
    ├── types.ts    # Zod スキーマ + z.infer した型（フォーム型と API 型の両方）
    ├── fetcher.ts  # クライアント → /api/... を叩く関数
    └── function.ts # サーバー側のDB処理（route.ts から呼ばれる）
```

ルートグループ: `(public)` 未ログイン向け（`login`, `signup/[id]`, `forgot-password`, `reset-password`, `pre-registration/[token]`）、`(private)` ログイン必須（`order`, `order-history`, `edit-profile`, `edit-payment`, `edit-password`, `register-payment`, `contact`）、`(test)` は製品外の検証用ページ。

API ルートは `app/api/<feature>/<action>/route.ts` に**画面と対称な形**で置く。`route.ts` はロジックを持たず、常にこの3ステップだけ：

```ts
export async function POST(req: NextRequest) {
  const validationResult = await validateRequest(req, XxxApiSchema);   // 1. 検証
  if (!validationResult.success) return NextResponse.json(validationResult.error, { status: ... });
  const result = await getXxx(validationResult.data);                  // 2. _lib/function.ts に委譲
  if (result.success) return NextResponse.json(result);                // 3. 返却
  return NextResponse.json(result.error, { status: result.error.status });
}
```

### リクエストの流れ

```
component.tsx
  → useApiQuery / useApiMutation      (app/_lib/hooks/query/)
  → _lib/fetcher.ts → fetcher()       (app/_lib/fetcher.ts)
  → app/api/.../route.ts
  → validateRequest()                 (app/_lib/validation.ts)
  → _lib/function.ts
  → Supabase
```

### DB アクセスは読み書きで別クライアント

|          | 使うもの                                               | 場所                          |
| -------- | ------------------------------------------------------ | ----------------------------- |
| **参照** | `@supabase/ssr` の `createClient()`                    | `app/_lib/supabase/server.ts` |
| **更新** | `pg` の `createPgClient()` で生 SQL + トランザクション | 同上                          |

更新系は `BEGIN` → 複数テーブル操作 → `COMMIT`、失敗時は `rollbackWithLog(client)`（`app/_lib/supabase/transaction.ts`）。INSERT/UPDATE 文は手書きせず `getPostgreSqlItems()`（`app/_lib/utils/utils.ts`）で `{ columns, placeholders, values }` を組み立てる。

**Supabase Storage の操作（アップロード/削除）は `pg` トランザクションの外側にあり、`rollbackWithLog` ではロールバックできない。** ファイルを差し替える処理を書くときは「アップロード成功 → 旧ファイル削除」の順を守ること。逆順にすると、アップロード失敗時にDBは旧ファイル名の参照にロールバックするが実体はすでに削除済みで、`Object not found` になる（`../minshoku` の commit 9b7d906 で実際に発生・修正）。

`t_shops`/`t_companies` テーブルの型は `app/_lib/supabase/tableTypes.d.ts` に手動定義（自動生成ではない）。

### エラーハンドリング

全 API が `ApiResponse<T> = ApiSuccess<T> | ApiError`（`app/_types/types.ts`）を返す。HTTPステータスだけで判断しない。

- エラーコードは `app/errors/ErrorCodes.ts` に **`E{HTTPステータス}-{連番}` 形式**で集約（例 `E400-05`, `E401-01`）。日本語メッセージもここ。新規エラーはここに追加してから使う。
- サーバー側は `throw new CustomError(code, message, status)` → `catch` で `{ success: false, error: e }` に変換して返す（例外を外に漏らさない）。
- `fetcher()`（`app/_lib/fetcher.ts`）が `!res.ok || !success` を `CustomError` として throw し直し、`useApiQuery` / `useApiMutation`（`app/_lib/hooks/query/`）が捕捉して**自動でSnackbar表示**する。呼び出し側で個別にエラー表示を書く必要はない。

### バリデーション

Zod スキーマは `_lib/types.ts` に置き、フォーム用とAPI境界用（`z.object({ request: FormSchema }).strict()` 相当）の2段構え。`validateRequest()`（`app/_lib/validation.ts`）は `multipart/form-data` を特別扱いし、`formValues` フィールドをJSONパースしたうえで画像フィールド（`shop_image_file_data` など）をマージする。

### クライアント状態

- **サーバー状態**: TanStack Query。素の `useQuery`/`useMutation` ではなく `useApiQuery` / `useApiMutation` を使う。キーは `app/_lib/hooks/query/queryKeys.ts` の `QUERY_KEYS`。
- **グローバルUI状態**: `app/_ui/state/` の Context 群 — `snackBar`（通知）/ `processing`（ローディング）/ `dirty`（未保存離脱ガード）。Provider の入れ子は `app/_ui/components/layouts/ClientLayoutWrapper.tsx`（ルートの `app/layout.tsx` → `AppLayoutContent.tsx` から呼ばれる）にまとめて設置されている。
- ステータス値は `app/_types/enum.ts` の enum で管理する。

### 認証

`middleware.ts` の `matcher` に列挙されたパスでのみ `app/_lib/supabase/middleware.ts` の `updateSession()` が走る（新しい保護対象ページを足したら `matcher` にも追加が必要）。ここでSupabaseセッションの有無に加え、`t_user` にレコードがあるか（無ければ強制ログアウト — 管理者アカウントでログインした場合など）、`user_registration_status` が支払方法登録待ち（`WAITING_PAYMENT_SETUP`）かどうかで `/register-payment` へのリダイレクト要否も判定している。

`app/_ui/components/layouts/AppLayoutContent.tsx`（サーバーコンポーネント）がリクエスト時にユーザー情報を先読みし、`AuthProvider`（`app/_ui/contexts/auth/AuthContext.tsx`）へ初期値として渡す。クライアント側では `useApiQuery` によるセッション状態のポーリングで補完される。

### 外部連携

- **GMO Payment**（プロトコルタイプ idPass）: クレジットカードは `app/(private)/order/_lib/gmoApi.ts`（`register-payment`/`edit-payment`にも同名ファイルあり）、PayPayは `app/(private)/order/_lib/paypayApi.ts`。エンドポイント・SiteID/SitePassは`GMO_BASE_URL`/`GMO_SITE_ID`/`GMO_SITE_PASS`環境変数（上記参照）。ShopID/ShopPassは`t_shops.gmo_shop_code`/`gmo_shop_password`（DB管理）。
- **Nodemailer**（`app/_lib/mailer/`）: 通知メール送信。

#### PayPay決済（`app/(private)/order/_lib/paypayApi.ts`）

GMO Payment Gatewayの「PayPay（都度決済）」を、既存のクレジットカードと同じGMO加盟店契約（ShopID/ShopPass）で利用する。クレジットカードと違い、ユーザーがPayPay画面へ**リダイレクトして承認するまで決済が確定しない非同期フロー**になるため、新設した `OrderStatusType.PENDING_PAYMENT`（決済待ち）ステータスと `PAYPAY_PENDING_TTL_MINUTES`（`app/_config/constants.ts`、10分）による在庫の仮確保・自動失効を組み合わせて実装している（`insertOrder`/`preOrder`/`completePaypayOrder`、`app/(private)/order/_lib/function.ts`）。

**フロー**: `entryTranPaypay`(取引登録) → `execTranPaypay`(決済実行、`StartURL`/`Token`取得) → クライアント側で`StartURL`へ`AccessID`+`Token`を**隠しフォームでPOST**送信しPayPay画面へ遷移 → 決済完了後GMOが`RetURL`へ通知 → `app/api/order/paypay-return/route.ts`が`searchTradePaypay`でサーバー間の真の結果を確認 → 注文確定(`VALID`)/失効(`SYSTEM_CANCEL`)。

**GMOの公開ドキュメント（docs.gmo-pg.com/mulpay）に記載が無く、GMOテスト環境での実疎通で判明した仕様**（本番でも同じ挙動である保証はないため、本番投入前に要再確認）:

| 項目                        | 内容                                                                                                                                                                                                                                                                                               |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ExecTranPaypay.idPass`     | クレジットの`ExecTran`と異なり`ShopID`/`ShopPass`が必須（未指定だと`M01002001`/`M01003001`）                                                                                                                                                                                                       |
| `RetURL`                    | 固定の環境変数ではなく、注文APIへの実際のリクエストのオリジン(`req.nextUrl.origin`)から組み立てる必要がある（`insertOrder`の第2引数として`route.ts`から渡している）                                                                                                                                |
| コールバック                | POSTではなく**GET**で届き、かつ**クエリパラメータは一切付与されない**。そのため`insertOrder`が`RetURL`自体に自前で`?orderId=...`を埋め込み、`paypay-return`側でそれを頼りに注文を特定している（GMO側のOrderID等のパラメータは信用できない）                                                        |
| `SearchTradeMulti.idPass`   | `PayType=45`を指定しないと`M01051001`（決済方法未指定）。成功時`Status=CAPTURE`（即時売上）                                                                                                                                                                                                        |
| `PaypayCancelReturn.idPass` | クレジットの`AlterTran`(`JobCd=VOID`)と異なり、`JobCd`ではなく`OrderID`+`CancelAmount`/`CancelTax`（取消/返金額を明示指定）で行う。`CancelAmount`は`t_order.amount`（会社負担込みの合計金額）ではなく、実際にPayPayへ請求された`user_burden_amount`と一致させる必要がある（不一致だと`M01085011`） |

GMOテスト環境の加盟店設定（ショップ管理コンソール）で、PayPay都度決済の売上区分を「仮売上/実売上」から「即時売上」に切り替えている前提のコード（`JobCd=CAPTURE`）になっている。切り替えていない場合は`E61546010`（処理区分エラー）になる。

## コーディング規約

- Prettier: シングルクォート / セミコロンあり / `printWidth: 120` / `tabWidth: 2`。`.prettierrc` が有効な設定で、`.prettier.json` は同内容の未使用ファイル。
- import順は `simple-import-sort` で **error**。`npm run fix` で自動整形する。
- パスエイリアスは `@/*` → リポジトリルート。
- `@typescript-eslint/no-unused-vars` は off。`any` を使う箇所は `// eslint-disable-next-line @typescript-eslint/no-explicit-any` を付ける既存慣習に従う。
- 関数にはJSDoc（`@param`/`@returns` を日本語で）を付ける。
- マジックナンバー・固定文言は `app/_config/constants.ts` に定義してから使う（`MSG_*` メッセージテンプレートは `formatString()` で埋め込む、`REG_*` は正規表現）。
- セクション区切りは `/* 見出し\n---...--- */` のコメント形式で統一されている。

## 触らない方がよい場所

- `app/(test)/testPage/` および `app/test/` — 製品外の検証用ページ。
