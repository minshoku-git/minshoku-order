import React, { useState } from 'react';
import { Box, Typography, IconButton, Card, CardContent, Button } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import itemImage from '../_images/item-image-curry.jpg';
import karasaImage from '../_images/karasa_02.svg';
import tabelogImage from '../_images/tabelog_logo.png';
import blankIcon from '../_images/icon-blank.svg';
import houseIcon from '../_images/icon-shop_b.svg';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Btn } from './Btn';
import Image from 'next/image';

import MenuDateNavigation from '../../_components/_parts/MenuDateNavigation';

export default function MenuCardOrdered() {
  const [expanded, setExpanded] = useState(false);

  const menuDate = '5月23日（金）';
  const ORDER_NUMBER = 1;

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
            </Box>

            <Button
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
          <Box display="flex" justifyContent="right" sx={{ width: '100%' }}>
            <Button sx={{ mx: 0, px: 0, minWidth: 'unset' }}>
              <Image src={tabelogImage} alt="食べログ" height={20} />
            </Button>
            <Button sx={{ mx: 0, px: 0, minWidth: 'unset' }}>
              <Image src={blankIcon} alt="別窓" height={16} ml={1} />
            </Button>
          </Box>

          <Typography variant="h6" fontWeight="bold">
            スパイスカレー
            <Image src={karasaImage} alt="辛さ" ml={1} sx={{ verticalAlign: 'middle', height: 3 }} />
          </Typography>

          <Typography color="error" fontWeight="bold" fontSize={32} sx={{ color: '#ea5315' }}>
            ￥{(500 * ORDER_NUMBER).toLocaleString()}
            <Typography
              component="span"
              color="textSecondary"
              sx={{ textDecoration: 'line-through', fontSize: 16, ml: 1 }}
            >
              ￥{(1100 * ORDER_NUMBER).toLocaleString()}
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
          <Typography textAlign="right" sx={{ fontSize: 18, fontWeight: 'bold', mr: 2, mt: 2 }}>
            注文済み：{ORDER_NUMBER}食
          </Typography>
          <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
            <Btn label="キャンセル" bgc="#afafaf" />
          </Box>
        </CardContent>
      </Card>
      <Typography variant="h6" fontWeight="bold" display="block" align="center" mt={3}>
        注文期限：当日13:00まで
      </Typography>
      <Typography variant="h6" fontWeight="bold" display="block" align="center">
        キャンセル期限：当日13:00まで
      </Typography>
    </>
  );
}
