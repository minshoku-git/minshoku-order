import * as React from 'react';

import { SignUpComponent } from './component';

export const metadata = {
  title: '新規会員登録',
};

export default async function Page() {
  return <SignUpComponent />;
}
