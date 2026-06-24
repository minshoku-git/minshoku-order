import { Box, Card, CardContent, Divider, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import React, { useState } from 'react';

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
  const amountSalePrice = (menuScheduleData.sale_price * props.count).toLocaleString()
  const amountListPrice = (menuScheduleData.list_price * props.count).toLocaleString()
  const isMealBurden = (amountSalePrice !== amountListPrice)

  /* useState
  ------------------------------------------------------------------ */
  // ⭕ 特定商取引法に基づく表記のモーダル開閉状態を管理
  const [openAct, setOpenAct] = useState(false);

  // ⭕ マスタから届いた特定商取引法に基づく表記の文章（データがない場合はデフォルト文言）
  const actText = props.data.shopData?.specified_commercial_transaction_act || '特定商取引法に基づく表記は登録されていません。';

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
            価格：{amountListPrice}円 {isMealBurden && <>→{amountSalePrice}円</>}(税込)
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
            支払い方法：{paymentTypeString}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 16, mb: 3, fontWeight: 'bold' }}>
            キャンセル：{companyData.cancel_period_day === 0 ? "当日" : companyData.cancel_period_day + '日前'}
            {companyData.cancel_period_time}まで
          </Typography>

          {/* ------------------------------------------------------------------ */}
          {/* ✨ 追加：特定商取引法に基づく表記のテキストリンク */}
          {/* ------------------------------------------------------------------ */}
          <Box display="flex" alignItems="center" justifyContent="center" sx={{ mb: 3 }}>
            <Typography
              variant="body2"
              onClick={() => setOpenAct(true)}
              sx={{
                fontSize: 14,
                color: '#1976d2', // きれいな青色リンク
                textDecoration: 'underline',
                cursor: 'pointer',
                fontWeight: '500',
                '&:hover': {
                  color: '#115293',
                },
              }}
            >
              特定商取引法に基づく表記
            </Typography>
          </Box>
          {/* ------------------------------------------------------------------ */}

          <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
            <Btn label="確定" eventhandler={() => props.orderHandler()} />
          </Box>
          <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
            <Btn label="戻る" eventhandler={() => props.backHandler()} bgc={'#707070'} />
          </Box>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* ✨ 追加：特定商取引法に基づく表記用 モーダルダイアログ */}
      {/* ------------------------------------------------------------------ */}
      <Dialog
        open={openAct}
        onClose={() => setOpenAct(false)}
        maxWidth="sm"
        fullWidth
        scroll="paper" // はみ出す長文の際はダイアログ内をスクロールさせる
        PaperProps={{
          sx: { borderRadius: 3 } // 角丸をカードのデザインと統一
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #e5e7eb', fontSize: 18, p: 2 }}>
          特定商取引法に基づく表記
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 2 }}>
          {/* 改行コード（\n）をそのまま反映させ、読みやすい行間に設定 */}
          <Typography
            variant="body2"
            sx={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
              fontSize: 14,
              color: '#333',
            }}
          >
            {actText}
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 1.5 }}>
          <Button
            onClick={() => setOpenAct(false)}
            variant="contained"
            sx={{
              backgroundColor: '#707070',
              '&:hover': { backgroundColor: '#505050' },
              borderRadius: 2,
              px: 3,
            }}
          >
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
      {/* ------------------------------------------------------------------ */}
    </>
  );
}