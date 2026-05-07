/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState } from 'react';
import { AddCard, CreditCard } from '@mui/icons-material';
import {
    Box,
    Button,
    colors,
    Divider,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Typography,
    TextField,
    Grid2,
} from '@mui/material';
import { JSX } from 'react';
import { Controller, FieldError, FieldErrors, SubmitHandler, UseFormHandleSubmit } from 'react-hook-form';

import { PaymentType, SelectType } from '@/app/_types/enum';
import { Btn } from '@/app/_ui/components/atoms/Button';
import { CreditCardData } from '@/app/(private)/edit-payment/_lib/types';


type Props = {
    handleSubmit: UseFormHandleSubmit<any>
    submitHandler: SubmitHandler<any>
    control: any
    paymentMethod: PaymentType
    cards?: CreditCardData[]
    isRegister: boolean
    /** 給与天引きFlag ※0:非/1:可 */
    deduction_flag: SelectType
    /** PaypayFlag ※0:非/1:可 */
    paypay_flag: SelectType
    /** クレジットカードFlag ※0:非/1:可 */
    credit_flag: SelectType
    onError?: (errors: any) => void
    error: FieldError | undefined
}

/**
 * 支払い方法の更新Component
 * @returns {JSX.Element} JSX
 */
export const PaymentForm = (props: Props): JSX.Element => {

    /* initialize
    ------------------------------------------------------------------ */
    const [showNewCardForm, setShowNewCardForm] = useState(false);

    return (
        <>
            <Divider sx={{ mb: 2, mt: 4 }} />
            {/* 給与天引き */}
            <form onSubmit={props.handleSubmit(props.submitHandler, props.onError)}>
                <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <Controller
                        name="paymentType"
                        control={props.control}
                        render={({ field }) => (
                            <RadioGroup {...field}>
                                {/* SALAEY_DEDUCTIONS */}
                                {props.deduction_flag === SelectType.SELECTED && <>
                                    <FormControlLabel
                                        value={PaymentType.SALAEY_DEDUCTIONS}
                                        control={<Radio />}
                                        label={<Typography fontWeight="bold">給与天引き（毎月の給与から天引き）</Typography>}
                                    />
                                    <Divider sx={{ my: 2 }} />
                                </>}
                                {/* PAYPAY */}
                                {props.paypay_flag === SelectType.SELECTED && <>
                                    <FormControlLabel
                                        value={PaymentType.PAYPAY}
                                        control={<Radio />}
                                        label={<Typography fontWeight="bold">PayPayオンライン決済</Typography>}
                                    />
                                    <Divider sx={{ my: 2 }} />
                                </>}
                                {/* CREDITCARD */}
                                {/* クレジットカード決済 */}
                            {props.credit_flag === SelectType.SELECTED && (
                                <>
                                    <FormControlLabel
                                        value={PaymentType.CREDITCARD}
                                        control={<Radio />}
                                        label={<Typography fontWeight="bold">クレジットカード決済</Typography>}
                                    />
                                    {/* クレジットカード決済が選択されている時のみ表示 */}
{props.paymentMethod === PaymentType.CREDITCARD && (
    <Box sx={{ pl: 4, mt: 1 }}>
        <Controller
            name="creditcard"
            control={props.control}
            render={({ field }) => (
                <RadioGroup {...field}>
                    {/* 1. 既存カードのリスト表示 */}
                    {props.cards?.map((card, i) => (
                        <FormControlLabel
                            key={i}
                            value={card.creditcardId}
                            control={<Radio />}
                            label={`カード番号: **** **** **** ${card.maskedCardNumber}`}
                            onClick={() => setShowNewCardForm(false)} // 既存選択時はフォームを閉じる
                        />
                    ))}

                    {/* 2. 新規登録ボタン */}
                    <Button
                        variant="outlined"
                        startIcon={<AddCard />}
                        onClick={() => {
                            setShowNewCardForm(true); // フォームを表示
                            field.onChange('new');    // 値を 'new' にしてバリデーションを通す
                        }}
                        sx={{ mt: 1, textTransform: 'none', justifyContent: 'flex-start' }}
                        fullWidth
                    >
                        新しいクレジットカードを登録する
                    </Button>

                    {/* 3. 【ここが消えていた部分】新規カード入力フォーム */}
                    {showNewCardForm && (
                        <Box sx={{ mt: 3, p: 2, bgcolor: '#f9f9f9', borderRadius: 1, border: '1px solid #ddd' }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                                <CreditCard sx={{ verticalAlign: 'middle', mr: 1 }} />
                                新規カード情報入力
                            </Typography>
                            
                            <Grid2 container spacing={2}>
                                <Grid2 size={12}>
                                    <TextField
                                        id="cardNo" // 後のトークン取得で使用
                                        label="カード番号"
                                        fullWidth
                                        size="small"
                                        inputProps={{ maxLength: 16 }}
                                    />
                                </Grid2>
                                <Grid2 size={4}>
                                    <TextField id="expireMonth" label="月(MM)" fullWidth size="small" inputProps={{ maxLength: 2 }} />
                                </Grid2>
                                <Grid2 size={4}>
                                    <TextField id="expireYear" label="年(YY)" fullWidth size="small" inputProps={{ maxLength: 2 }} />
                                </Grid2>
                                <Grid2 size={4}>
                                    <TextField id="securityCode" label="CVV" type="password" fullWidth size="small" inputProps={{ maxLength: 4 }} />
                                </Grid2>
                            </Grid2>
                            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                                ※入力されたカード情報は直接決済会社へ送信され、弊社サーバーには保存されません。
                            </Typography>
                        </Box>
                    )}
                </RadioGroup>
            )}
        />
        {/* バリデーションエラーメッセージの表示 */}
        {props.error && (
            <Typography sx={{ color: '#d32f2f', fontSize: '0.75rem', mt: 1 }}>
                {props.error.message}
            </Typography>
        )}
    </Box>
)}
                                </>
                            )}
                                {/* Credit Card Payment */}
                            </RadioGroup>
                        )}
                    />
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                        <Btn label={props.isRegister ? '支払い方法を登録' : '支払い方法を更新'} isSubmit={true} />
                    </Box>
                </FormControl>
            </form>
        </>
    );
};
