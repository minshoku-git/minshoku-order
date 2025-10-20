// eslint-disable-next-line simple-import-sort/imports
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Button, Card, CardContent, Grid2 as Grid, IconButton, Skeleton, Typography } from '@mui/material';
import Image from 'next/image';
import React, { useState } from 'react';

import houseIcon from '../../../assets/images/icon-shop_b.svg';
import karasaImage1 from '../../../assets/images/karasa_01.svg';
import karasaImage2 from '../../../assets/images/karasa_02.svg';
import karasaImage3 from '../../../assets/images/karasa_03.svg';
import tabelogImage from '../../../assets/images/tabelog_logo.png';
import StoreModal from '../StoreModal';
import { Btn } from '../../atoms/Button';
import { OrderInitResponse } from '@/app/(private)/order/_lib/types';

type Props = {
  count: number;
  setCount: (value: React.SetStateAction<number>) => void;
  preOrderHandler: (orderCount: number) => void;
  cancelOrderHandler: () => void;
  data: OrderInitResponse
};

export default function MenuCard(props: Props) {
  /* initialize
  ------------------------------------------------------------------ */
  const menuScheduleData = props.data.menuScheduleData!
  const shopData = props.data.shopData!
  const companyData = props.data.companyData!
  const orderData = props.data.orderData
  const [imageLoaded, setImageLoaded] = useState(false);

  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const REST_OF_ORDER = menuScheduleData.stock_count - menuScheduleData.orderCount;

  /* functions - 会員情報の更新
  ------------------------------------------------------------------ */
  const moveTabelogSite = () => {
    window.open(shopData.tabelog_url, '_blank', 'noopener,noreferrer');
  }

  /* functions - 会員情報の更新
  ------------------------------------------------------------------ */

  return (
    <>
      {/* カード */}
      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16 / 9',
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: '#ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {!imageLoaded && (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height="100%"
                  sx={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
                />
              )}

              {shopData.shop_image_file ? (
                <Image
                  src={shopData.shop_image_file}
                  fill
                  style={{
                    objectFit: 'cover',
                    transition: 'opacity 0.3s ease-in-out',
                    opacity: imageLoaded ? 1 : 0,
                  }}
                  alt="Example"
                  priority
                  onLoad={() => setImageLoaded(true)}
                  sizes="(max-width: 640px) 100vw, 640px"
                />
              ) : (
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: '#666',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    zIndex: 2,
                    position: 'absolute',
                  }}
                >
                  NO IMAGE
                </Typography>
              )}

              {imageLoaded && (
                <Button
                  onClick={handleOpen}
                  sx={{
                    width: '12%',
                    aspectRatio: '16 / 9',
                    padding: 0,
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.7)',
                    position: 'absolute',
                    right: '3%',
                    bottom: '6%',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      width: '70%',
                      height: '70%',
                    }}
                  >
                    <Image
                      src={houseIcon}
                      alt="店舗紹介"
                      fill
                      style={{
                        objectFit: 'contain',
                      }}
                    />
                  </Box>
                </Button>
              )}
            </Box>

          </Box>
          {shopData.tabelog_url &&
            <Box display="flex" justifyContent="right" sx={{ width: '100%', mt: 1 }}>
              <Button sx={{ mx: 0, p: 1, minWidth: 'unset' }} onClick={() => moveTabelogSite()}>
                <Image src={tabelogImage} alt="食べログ" height={20} />
              </Button>
            </Box>
          }

          <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
            {menuScheduleData.menu_name}
            {menuScheduleData.spice_level > 0 &&
              <Image
                src={
                  menuScheduleData.spice_level === 1
                    ? karasaImage1
                    : menuScheduleData.spice_level === 2
                      ? karasaImage2
                      : karasaImage3} alt={'辛さレベル' + menuScheduleData.spice_level}
                style={{ verticalAlign: 'middle', height: 30, width: 'auto', marginLeft: 20, }} />
            }
          </Typography>

          <Typography color="error" fontWeight="bold" fontSize={32} sx={{ color: '#ea5315' }}>
            ￥{(menuScheduleData.sale_price * props.count).toLocaleString()}
            <Typography
              component="span"
              color="textSecondary"
              sx={{ textDecoration: 'line-through', fontSize: 16, ml: 1 }}
            >
              ￥{(menuScheduleData.list_price * props.count).toLocaleString()}
            </Typography>
            <Typography component="span" color="textSecondary" sx={{ fontSize: 16, ml: 1 }}>
              （税込）
            </Typography>
          </Typography>

          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: 640,
              mx: 'auto',
              bgcolor: '#fff',
              px: 2,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                maxHeight: expanded ? 'none' : 80, // 折りたたみ時の高さ
                overflow: 'hidden',
                transition: 'max-height 0.5s',
              }}
            >
              <Typography variant="body2">
                {menuScheduleData.menu_name}
              </Typography>
              <Typography variant="body2">アレルギー表記：{menuScheduleData.allergen_labelling ?? 'なし'}</Typography>
            </Box>
            {/* フェードオーバーレイ */}
            {!expanded && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 60,
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, #fff 100%)',
                }}
              />
            )}

            {/* トグルボタン */}
            <Box
              display="flex"
              justifyContent="center"
              mt={1}
              sx={{ position: 'absolute', right: 16, bottom: expanded ? -16 : 8 }}
            >
              <IconButton onClick={() => setExpanded(!expanded)} color="primary">
                {expanded ? <ExpandLessIcon sx={{ color: '#333' }} /> : <ExpandMoreIcon sx={{ color: '#333' }} />}
              </IconButton>
            </Box>
          </Box>

          {/* フッター */}
          {/* 注文中 */}
          {!orderData ? (<>
            {!menuScheduleData.isOrderDeadlinePassed ? (<>
              {REST_OF_ORDER > 0 ? (
                <Grid container alignItems="end" justifyContent="space-between" mt={3}>
                  <Grid>
                    <Typography sx={{ color: '#333', fontWeight: 'bold' }}>残り{REST_OF_ORDER - props.count} 食</Typography>
                    <Box
                      sx={{
                        color: '#333',
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #333',
                        borderRadius: 1,
                        px: 1,
                        height: 53,
                        width: 132,
                      }}
                    >
                      <Typography
                        sx={{ color: '#333', fontWeight: 'bold', display: 'block', minWidth: 'unset', width: '40%' }}
                      >
                        数量
                      </Typography>
                      <Button
                        sx={{ color: '#333', fontWeight: 'bold', display: 'block', minWidth: 'unset', width: '20%' }}
                        onClick={() => props.setCount((count) => (count > 1 ? count - 1 : 1))}
                      >
                        -
                      </Button>
                      <Typography
                        sx={{
                          color: '#333',
                          fontWeight: 'bold',
                          display: 'block',
                          minWidth: 'unset',
                          width: '20%',
                          textAlign: 'center',
                        }}
                      >
                        {props.count}
                      </Typography>
                      <Button
                        sx={{ color: '#333', fontWeight: 'bold', display: 'block', minWidth: 'unset', width: '20%' }}
                        onClick={() => props.setCount((count) => (count == REST_OF_ORDER ? REST_OF_ORDER : (count += 1)))}
                      >
                        +
                      </Button>
                    </Box>
                  </Grid>
                  <Grid>
                    <Button
                      variant="contained"
                      sx={{
                        ml: 2,
                        height: 53,
                        background: '#ea5315',
                        fontWeight: 'bold',
                        borderRadius: '16px',
                        width: 164,
                        fontSize: 18,
                      }}
                      color="warning"
                      onClick={() => props.preOrderHandler(props.count)}
                    >
                      注文する
                    </Button>
                  </Grid>
                </Grid>) :
                (<Grid>
                  <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                    <Typography textAlign="right" sx={{ fontSize: 18, fontWeight: 'bold', mr: 2, mt: 2 }}>
                      本日分完売しました！
                    </Typography>
                  </Box>
                </Grid>)}
            </>) :
              (<Grid>
                <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                  <Typography textAlign="right" sx={{ fontSize: 18, fontWeight: 'bold', mr: 2, mt: 2 }}>
                    注文期限を過ぎています
                  </Typography>
                </Box>
              </Grid>)}
          </>
          ) : (
            <>
              {/* 注文キャンセル */}
              <Grid>
                <Typography textAlign="right" sx={{ fontSize: 18, fontWeight: 'bold', mr: 2, mt: 2 }}>
                  注文済み：{orderData?.order_count}食
                </Typography>
                {orderData.isCancellable
                  ?
                  (<Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                    <Btn label="キャンセル" bgc="#afafaf" eventhandler={() => props.cancelOrderHandler()} />
                  </Box>)
                  :
                  <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                    <Typography textAlign="right" sx={{ fontSize: 18, fontWeight: 'bold', mr: 2, mt: 2 }}>
                      キャンセル期限を過ぎています
                    </Typography>
                  </Box>
                }
              </Grid>
            </>
          )}
        </CardContent>
      </Card>
      <Typography variant="h6" fontWeight="bold" display="block" align="center" mt={3}>
        提供時間：
        {companyData.offer_time_from}から{companyData.offer_time_to}まで
      </Typography>
      <Typography variant="h6" fontWeight="bold" display="block" align="center" >
        注文期限：
        {companyData.order_period_day === 0 ? "当日" : companyData.order_period_day + '日前'}
        {companyData.order_period_time}まで
      </Typography>
      <Typography variant="h6" fontWeight="bold" display="block" align="center">
        キャンセル期限：
        {companyData.cancel_period_day === 0 ? "当日" : companyData.cancel_period_day + '日前'}
        {companyData.cancel_period_time}まで
      </Typography>

      <StoreModal
        open={open}
        handleClose={handleClose}
        storeInfo={{
          name: shopData.shop_name,
          desc: shopData.shop_description
        }}
      />
    </>
  );
}
