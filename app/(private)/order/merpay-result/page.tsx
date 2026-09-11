import * as React from 'react';
import { Suspense } from 'react';

import { MerpayResultComponent } from './component';

export const metadata = {
  title: 'メルペイお支払い結果',
};

export default async function Page() {
  return (
    // MEMO: useSearchParams()がclient専用のHookなので、page.tsxをServerComponent扱いするためにSuspenseでラップする
    <Suspense fallback={<div></div>}>
      <MerpayResultComponent />
    </Suspense>
  );
}
