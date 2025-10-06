import { Box, Card, CardContent, Grid2 as Grid, Skeleton } from '@mui/material';
import React from 'react';


export default function MenuCardSkeleton() {
  return (
    <>
      <Box display="flex" justifyContent="center" alignItems="center" mb={1}>
        <Skeleton variant="text" width="80%" height={55} />
      </Box>
      {/* カード */}
      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          {/* 画像部分のスケルトン */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 9',
            }}
          >
            <Skeleton
              variant="rectangular"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: '16px',
              }}
            />
          </Box>
          {/* 食べログボタンのスケルトン */}
          <Box sx={{ display: 'flex', justifyContent: 'right', mt: 1 }}>
            <Skeleton variant="rectangular" width={50} height={20} />
          </Box>
          {/* メニュー名のスケルトン */}
          <Skeleton variant="text" width="80%" height={30} sx={{ mt: 1 }} />
          {/* 価格のスケルトン */}
          <Skeleton variant="text" width="60%" height={40} />
          {/* 詳細テキストのスケルトン */}
          <Box sx={{ mt: 2 }}>
            <Skeleton variant="text" height={20} />
            <Skeleton variant="text" height={20} />
          </Box>
          {/* フッター部分のスケルトン */}
          <Grid container alignItems="end" justifyContent="space-between" mt={3}>
            <Grid>
              <Skeleton variant="text" width={100} height={20} />
              <Skeleton variant="rectangular" width={132} height={53} sx={{ mt: 1 }} />
            </Grid>
            <Grid>
              <Skeleton variant="rectangular" width={164} height={53} sx={{ borderRadius: '16px' }} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );
}
