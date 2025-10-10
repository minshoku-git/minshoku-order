import { Box, Card, CardContent, Divider, Typography } from '@mui/material';
import React from 'react';

import { OrderInitResponse } from '@/app/(private)/order/_lib/types';

import { Btn } from '../../atoms/Button';

type Props = {
  data: OrderInitResponse
  count: number
  backHandler: () => Promise<void>
  orderHandler: () => Promise<void>
}

export default function MenuCardConfirm(props: Props) {
  /* initialize
  ------------------------------------------------------------------ */
  const menuScheduleData = props.data.menuScheduleData!
  const companyData = props.data.companyData!
  const paymentTypeString = props.data.paymentTypeString!
  const amount = (menuScheduleData.sale_price * props.count).toLocaleString()
  const amount2 = (menuScheduleData.list_price * props.count).toLocaleString()

  return (
    <>
      {/* カード */}
      <Card sx={{ borderRadius: 4, mt: 2 }}>
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
            日付：{menuScheduleData.delivery_day.toString()}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
            時間：{companyData.offer_time_from}～{companyData.offer_time_to}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
            場所：{companyData.location}
          </Typography>
          <Divider sx={{ background: '#333', mb: 1 }} />
          <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
            商品：{menuScheduleData.menu_name}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
            数量：{props.count}食
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
            価格：{amount2}円→{amount}円(税込)
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
            支払い方法：{paymentTypeString}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
            キャンセル：{companyData.cancel_period_day === 0 ? "当日" : companyData.cancel_period_day + '日前'}
            {companyData.cancel_period_time}まで
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
