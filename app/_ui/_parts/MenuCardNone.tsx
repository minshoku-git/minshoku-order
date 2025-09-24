import { Card, CardContent, Link, Typography } from '@mui/material';
import React from 'react';

export default function MenuCardNone() {
  return (
    <>
      {/* カード */}
      <Card sx={{ borderRadius: 4, mt: 2 }}>
        <CardContent>
          <Typography sx={{ fontSize: 16 }}>
            いつもご利用ありがとうございます。
            <br />
            次回のメニューが表示されるまで少々お待ちください。
            <br />
            過去にご注文いただいた情報は<Link href='/order-history' sx={{ fontSize: 16 }}>履歴ページ</Link>からご確認いただくことができます。
          </Typography>
        </CardContent>
      </Card>
    </>
  );
}
