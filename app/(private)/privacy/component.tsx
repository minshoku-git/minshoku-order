'use client';
import { Box, Card, CardContent, List, ListItem, ListItemText, Typography } from '@mui/material';
import { JSX } from 'react';

/* ページ名 */
const pageName = '個人情報保護方針';

/**
 * 個人情報保護方針Component
 * @returns {JSX.Element} JSX
 */
export const PrivacyComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Typography variant="h3" sx={{ fontSize: 20, mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
            個人情報保護方針
          </Typography>
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              第1条「ユーザー」等の定義
            </Typography>

            <List sx={{ listStyleType: 'decimal', pl: 2 }}>
              <ListItem sx={{ display: 'list-item' }}>
                <ListItemText
                  primary={
                    <Typography variant="body1">
                      「当サイト」とは、株式会社みんなの社食（以下、弊社と言います）が提供・運営するプラットフォームサービスである「みんなの社食」を指します。「ユーザー」とは、本規約を承諾のうえ、食事等の購入のために当サイトをご利用いただく方を指します。「会員ユーザー」とは、ユーザー情報の登録・弊社による承認を経て、会員IDを持ったユーザーを指します。「加盟店」とは、当サイトに食事等の販売のための情報・広告を掲載する企業または店舗を指します。
                    </Typography>
                  }
                />
              </ListItem>

              <ListItem sx={{ display: 'list-item' }}>
                <ListItemText
                  primary={
                    <Typography variant="body1">
                      当サイトは、加盟店とユーザーとの間で食事の売買および配送に関する取引ができるサービス（以下、サービスと言います）を提供しています。加盟店とユーザーとの間の売買契約および配送に関する契約（以下、売買契約等といいます）は、双方の意思が合致したときに成立します。
                    </Typography>
                  }
                />
              </ListItem>

              <ListItem sx={{ display: 'list-item' }}>
                <ListItemText
                  primary={
                    <Typography variant="body1">
                      弊社は、食事に関する売買契約等に関して契約当事者として権利、義務および責任を一切有しておらず、売買契約等について一切責任を負うものではありません。
                    </Typography>
                  }
                />
              </ListItem>

              <ListItem sx={{ display: 'list-item' }}>
                <ListItemText
                  primary={
                    <Typography variant="body1">
                      弊社が、ユーザーとして利用して頂くことを不適切と判断した場合、ご利用をお断りする場合があります。
                    </Typography>
                  }
                />
              </ListItem>
            </List>
          </Box>
        </CardContent>
      </Card>
    </>
  );
};
