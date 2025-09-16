import { Box, Card, CardContent, Divider, Typography } from '@mui/material';
import React from 'react';

import { Btn } from './Btn';

type Props = {
  backHandler: () => Promise<void>
  orderHandler: () => Promise<void>
}

export default function MenuCardConfirm(props: Props) {
  return (
    <>
      {/* カード */}
      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Typography variant="h3" sx={{ fontSize: 20, mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
            注文確認
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 16, mb: 4 }}>
            注文内容は下記の通りです。
            <br />
            内容をご確認のうえ、「確定」をクリックしてください。ご注文が確定されます。
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
            日付：2026年5月23日（金）
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
            時間：12:00〜13:00
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
            場所：カフェテリア
          </Typography>
          <Divider sx={{ background: '#333', mb: 1 }} />
          <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
            商品：スパイスカレー
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
            数量：1食
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
            価格：1,100円→500円(税込)
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
            支払い方法：給与天引
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
            キャンセル：当日9:45まで
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', flexFlow: 'column', gap: 2, mt: 4 }} >
            <Btn label="確定" eventhandler={() => props.orderHandler()} />
            <Btn bgc="#afafaf" label="戻る" eventhandler={() => props.backHandler()} />
          </Box>
        </CardContent>
      </Card>
    </>
  );
}
