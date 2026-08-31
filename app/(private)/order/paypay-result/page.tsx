import * as React from 'react';
import { Suspense } from 'react';

import { PaypayResultComponent } from './component';

export const metadata = {
  title: 'PayPayお支払い結果',
};

export default async function Page() {
  return (
    // MEMO: useSearchParams()がclient専用のHookなので、page.tsxをServerComponent扱いするためにSuspenseでラップする
    <Suspense fallback={<div></div>}>
      <PaypayResultComponent />
    </Suspense>
  );
}
