// eslint-disable-next-line simple-import-sort/imports
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Button, Card, CardContent, Grid2 as Grid, IconButton, Typography } from '@mui/material';
import Image from 'next/image';
import React, { useState } from 'react';

import curreyIcon from '../_images/curryshop-hatsukoi.svg';
import blankIcon from '../_images/icon-blank.svg';
import houseIcon from '../_images/icon-shop_b.svg';
import itemImage from '../_images/item-image-curry.jpg';
import karasaImage from '../_images/karasa_02.svg';
import tabelogImage from '../_images/tabelog_logo.png';
import StoreModal from './StoreModal';
import { Btn } from './Btn';

type Props = {
  orderhandler: () => void;
};

export default function MenuCard(props: Props) {
  const [expanded, setExpanded] = useState(false);
  const [count, setCount] = useState(1);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const menuDate = '5月23日（金）';
  const REST_OF_ORDER = 32;

  const orderhandler = () => { };

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
              }}
            >
              <Image src={itemImage} fill style={{ objectFit: 'cover' }} alt="Example" />
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
                    alt="ハウスアイコン"
                    fill
                    style={{
                      objectFit: 'contain',
                    }}
                  />
                </Box>
              </Button>
            </Box>
          </Box>
          <Box display="flex" justifyContent="right" sx={{ width: '100%' }}>
            <Button sx={{ mx: 0, px: 0, minWidth: 'unset' }}>
              <Image src={tabelogImage} alt="食べログ" height={20} />
            </Button>
            <Button sx={{ mx: 0, px: 0, minWidth: 'unset' }}>
              <Image src={blankIcon} alt="別窓" height={16} />
            </Button>
          </Box>

          <Typography variant="h6" fontWeight="bold">
            スパイスカレー
            <Image src={karasaImage} alt="辛さ" style={{ verticalAlign: 'middle', height: 30, marginLeft: 6 }} />
          </Typography>

          <Typography color="error" fontWeight="bold" fontSize={32} sx={{ color: '#ea5315' }}>
            ￥{(500 * count).toLocaleString()}
            <Typography
              component="span"
              color="textSecondary"
              sx={{ textDecoration: 'line-through', fontSize: 16, ml: 1 }}
            >
              ￥{(1100 * count).toLocaleString()}
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
            <Typography
              variant="body2"
              sx={{
                maxHeight: expanded ? 'none' : 80, // 折りたたみ時の高さ
                overflow: 'hidden',
                transition: 'max-height 0.5s',
              }}
            >
              商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明商品説明
            </Typography>

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
          {true && (
            <>
              <Grid container alignItems="end" justifyContent="space-between" mt={3}>
                <Grid>
                  <Typography sx={{ color: '#333', fontWeight: 'bold' }}>残り{REST_OF_ORDER - count} 食</Typography>
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
                      onClick={() => setCount((count) => (count !== 0 ? count - 1 : 0))}
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
                      {count}
                    </Typography>
                    <Button
                      sx={{ color: '#333', fontWeight: 'bold', display: 'block', minWidth: 'unset', width: '20%' }}
                      onClick={() => setCount((count) => (count == REST_OF_ORDER ? REST_OF_ORDER : (count += 1)))}
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
                  >
                    注文する
                  </Button>
                </Grid>
              </Grid>
            </>
          )}
          {/* 注文キャンセル */}
          {false && (
            <>
              <Grid>
                <Typography textAlign="right" sx={{ fontSize: 18, fontWeight: 'bold', mr: 2, mt: 2 }}>
                  注文済み：1食
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                  <Btn label="キャンセル" bgc="#afafaf" eventhandler={() => { }} />
                </Box>
              </Grid>
            </>
          )}
        </CardContent>
      </Card>
      <Typography variant="h6" fontWeight="bold" display="block" align="center" mt={3}>
        注文期限：当日13:00まで
      </Typography>
      <Typography variant="h6" fontWeight="bold" display="block" align="center">
        キャンセル期限：当日13:00まで
      </Typography>

      <StoreModal
        open={open}
        handleClose={handleClose}
        storeInfo={{
          logo: curreyIcon,
          alt: 'カレーショップ初恋',
          name: 'カレーショップ初恋',
          desc: `店舗紹介店舗紹介店舗紹介60年続いたスナック跡地にオープンした渋谷のスパイスカレー&クラフトビリヤニ専門店。スリランカ・南インド料理をベースにした自由な発想で創られたカレーとビリヤニが自慢。料理は化学調味料や着色料不使用、グルテンフリー。野菜を中心としたアチャールなどの惣菜、ダルカレー、スパイス卵が付いた、身体と心に優しいバランス食となっています。\n名物のボルディブフィッシュの旨味と複雑なスパイスとハーブの香りが自慢の唯一無二のテイストをご賞味下さい。`,
        }}
      />
    </>
  );
}
