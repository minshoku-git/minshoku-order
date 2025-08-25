import * as React from 'react';
import { Suspense } from 'react';

import { TestPageComponent } from './component';

export const metadata = {
  title: 'パスワードの更新',
};

export default async function Page() {
  return (
    // MEMO:
    // useSearchParams()がclient専用のHookなので
    // page.tsxをServerComponent扱いするためにSuspenseでラップする
    <Suspense fallback={<div></div>}>
      <TestPageComponent />
    </Suspense>
  );
}
