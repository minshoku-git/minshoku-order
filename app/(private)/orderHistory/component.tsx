'use client';
import { Box, Card, CardContent, Divider, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { JSX, useState } from 'react';

import { SearchType, SortType } from '@/app/_types/enum';
import { HeaderStatus } from '@/app/_types/types';
import { useProcessing } from '@/app/_ui/processing/processingContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

/* ページ名 */
const pageName = '注文履歴';
/* 明細行ヘッダー */
const resultHeader: Array<HeaderStatus> = [
  { name: '会社名', variableName: 'company_name', sort: SortType.ASC },
  { name: '支店名', variableName: 'branch_name', sort: SortType.ASC },
  { name: '住所', variableName: 'address', sort: SortType.ASC },
  { name: '利用ステータス', variableName: 'usage_status', sort: SortType.ASC },
];

/**
 * 会社一覧Component
 * @returns {JSX.Element} JSX
 */
export const OrderHistoryComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();
  const { openSnackbar } = useSnackBar();

  /* mockData ※のちすて
  ------------------------------------------------------------------ */
  const [historyList, setHistoryList] = useState([
    {
      date: '5月23日（金）',
      shop: '店舗：カリガリ',
      item: '商品：スパイスカレー',
      num: '数量：1食',
      price: '金額：500円（税込）',
      paymentType: '支払い方法：給与天引',
    },
    {
      date: '5月22日（木）',
      shop: '店舗：カレーの初恋',
      item: '商品：スパイスカレー',
      num: '数量：1食',
      price: '金額：500円（税込）',
      paymentType: '支払い方法：給与天引',
      cancel: [
        {
          shop: '店舗：カリガリ',
          item: '商品：スパイスカレー',
          num: '数量：1食',
          price: '金額：500円（税込）',
          paymentType: '支払い方法：給与天引',
        },
      ],
    },
    {
      date: '5月21日（水）',
      shop: '店舗：カリガリ',
      item: '商品：スパイスカレー',
      num: '数量：1食',
      price: '金額：500円（税込）',
      paymentType: '支払い方法：給与天引',
    },
  ]);

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Typography variant="h3" sx={{ fontSize: 20, mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
            注文履歴
          </Typography>
          <Box>
            {historyList.map((history, i) => (
              <Box key={i} sx={{ mb: i + 1 == historyList.length ? 0 : 5 }}>
                <Typography
                  variant="h3"
                  sx={{ fontSize: 16, mb: 2, fontWeight: 'bold', background: '#ffb59a', py: 1, px: 2 }}
                >
                  {history.date}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
                  {history.shop}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
                  {history.item}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
                  {history.num}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
                  {history.price}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
                  {history.paymentType}
                </Typography>
                {history.cancel && (
                  <Box>
                    <Divider sx={{ mt: 2, mb: 2, background: '#333' }} />
                    <Typography
                      variant="h3"
                      sx={{
                        fontSize: 16,
                        mb: 2,
                        fontWeight: 'bold',
                        background: '#afafaf',
                        display: 'inline-block',
                        py: 1,
                        px: 2,
                      }}
                    >
                      キャンセル済み
                    </Typography>
                    {history.cancel.map((c, ci) => (
                      <Box key={ci}>
                        <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
                          {c.shop}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
                          {c.item}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
                          {c.num}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
                          {c.price}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: 16, mb: 1, fontWeight: 'bold' }}>
                          {c.paymentType}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </>
  );
};
