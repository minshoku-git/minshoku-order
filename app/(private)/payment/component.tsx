'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Divider,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useRouter } from 'next/navigation';
import { JSX, useState } from 'react';
import { useForm } from 'react-hook-form';
import { SelectElement, TextFieldElement } from 'react-hook-form-mui';

import { getNow } from '@/app/_lib/getDateTime';
import { Btn } from '@/app/_ui/_parts/Btn';
import { useProcessing } from '@/app/_ui/processing/processingContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

import { UserPaymentFormValues, UserPaymentSchema } from './_lib/types';

/* ページ名 */
const pageName = '支払設定';

/**
 * 会社一覧Component
 * @returns {JSX.Element} JSX
 */
export const PaymentComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();
  const { openSnackbar } = useSnackBar();
  const { openProcessing, closeProcessing } = useProcessing();

  /* useForm
  ------------------------------------------------------------------ */
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isDirty },
  } = useForm<UserPaymentFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(UserPaymentSchema),
    defaultValues: {
      payment_type: 1,
      creditcard_year: '-1',
      creditcard_month: '-1',
      creditcard_number: '',
      security_code: '',
    },
  });

  /* useState
  ------------------------------------------------------------------ */
  /* useEffect
  ------------------------------------------------------------------ */
  /* mockData ※のちすて
  ------------------------------------------------------------------ */
  const month = Array.from({ length: 12 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return {
      id: num,
      label: num,
    };
  });
  const years = Array.from({ length: 21 }, (_, i) => {
    const currentYear = getNow().getFullYear() - 1;
    const num = String(currentYear + i + 1);
    return {
      id: num,
      label: num,
    };
  });

  const handleInput = (event: { target: { value: string } }) => {
    const newValue = event.target.value.replace(/[^0-9]/g, ''); // 半角英数字以外の文字を削除
    setValue('creditcard_number', newValue);
  };

  /* JSX
  ------------------------------------------------------------------ */
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [creditOption, setCreditOption] = useState('');
  const [cards, setCards] = useState(['************1111', '************2222']);

  return (
    <>
      {/* 上部リンク */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: 20 }}>
          支払い方法／新規会員登録
        </Typography>
      </Box>
      <Typography variant="body1">支払い方法をご選択ください。</Typography>
      <Divider sx={{ mb: 2, mt: 4 }} />
      {/* 給与天引き */}
      <FormControl component="fieldset" sx={{ width: '100%' }}>
        <RadioGroup name="payment" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <FormControlLabel
            value="salary"
            control={<Radio />}
            label={<Typography fontWeight="bold">給与天引き（毎月の給与から天引き）</Typography>}
          />
          <Divider sx={{ my: 2 }} />

          {/* クレジットカード決済 */}
          <FormControlLabel
            value="credit"
            control={<Radio />}
            label={<Typography fontWeight="bold">クレジットカード決済</Typography>}
          />

          {paymentMethod === 'credit' && (
            <>
              <Box sx={{ pl: 2 }}>
                <RadioGroup name="credit-option" value={creditOption} onChange={(e) => setCreditOption(e.target.value)}>
                  {cards.map((card, i) => (
                    <FormControlLabel
                      key={i}
                      value={`card${i}`}
                      control={<Radio />}
                      label={<Typography fontWeight="bold">カード番号{card}</Typography>}
                    />
                  ))}
                  <FormControlLabel
                    value="new"
                    sx={{ border: '1px solid #ddd', mr: 1, background: '#fff', borderRadius: 1 }}
                    control={<Radio />}
                    label={<Typography fontWeight="bold">新しいクレジットカードを登録する</Typography>}
                  />
                </RadioGroup>
              </Box>
              {creditOption === 'new' && (
                <Box sx={{ border: '1px solid #ddd', p: 2, mt: 2, ml: 1, borderRadius: 1, background: '#fff' }}>
                  <Typography variant="body2" fontWeight="bold">
                    カード番号
                  </Typography>
                  <TextFieldElement
                    control={control}
                    type="credit"
                    name="creditcard_number"
                    fullWidth
                    placeholder="例)123456781234"
                    variant="outlined"
                    onChange={handleInput}
                  // margin="normal"
                  />
                  <Typography variant="body2" fontWeight="bold" sx={{ mt: 2 }}>
                    有効期限
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box sx={{ xs: 6, display: 'flex', alignItems: 'center' }}>
                      <SelectElement
                        control={control}
                        name={'creditcard_month'}
                        options={[{ id: '-1', label: '月を選択' }, ...month]}
                        fullWidth
                      />
                      <Typography ml={2}>月</Typography>
                    </Box>
                    <Box sx={{ xs: 6, display: 'flex', alignItems: 'center' }}>
                      <SelectElement
                        control={control}
                        name={'creditcard_year'}
                        options={[{ id: '-1', label: '年を選択' }, ...years]}
                        fullWidth
                      />
                      <Typography ml={2}>年</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Grid container spacing={0}>
                      <Box sx={{ xs: 12 }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ mt: 2 }}>
                          セキュリティコード
                        </Typography>
                      </Box>
                      <Grid sx={{ xs: 6 }}>
                        <TextField
                          placeholder="例)123"
                          variant="outlined"
                          fullWidth
                          slotProps={{
                            htmlInput: { maxLength: 3, pattern: '[0-9]*' },
                            input: {
                              inputMode: 'numeric',
                            },
                          }}
                        // margin="normal"
                        />
                      </Grid>
                      <Grid sx={{ xs: 6, mt: 2 }} alignSelf="center">
                        <Tooltip title="カード裏面に記載されているセキュリティコードをご入力ください。">
                          <Typography variant="body2" color="primary" sx={{ whiteSpace: 'nowrap' }}>
                            セキュリティコードについて
                          </Typography>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              )}
            </>
          )}
          <Divider sx={{ my: 2 }} />

          {/* PayPay */}
          <FormControlLabel
            value="paypay"
            control={<Radio />}
            label={<Typography fontWeight="bold">PayPayオンライン決済</Typography>}
          />
        </RadioGroup>
        {/* 支払い方法を登録ボタン */}

        <Divider sx={{ my: 2 }} />
        <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
          <Btn label={'支払い方法を登録'} eventhandler={() => console.log('click')} />
        </Box>
      </FormControl>
    </>
  );
};
