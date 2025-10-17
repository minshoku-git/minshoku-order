/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { AddCard } from '@mui/icons-material';
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

    return (
        <>
            <Divider sx={{ mb: 2, mt: 4 }} />
            {/* 給与天引き */}
            <form onSubmit={props.handleSubmit(props.submitHandler)}>
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
                                {props.credit_flag === SelectType.SELECTED && <>
                                    <FormControlLabel
                                        value={PaymentType.CREDITCARD}
                                        control={<Radio />}
                                        label={<Typography fontWeight="bold">クレジットカード決済</Typography>}
                                    />
                                    {props.paymentMethod === PaymentType.CREDITCARD && (
                                        <>
                                            <Box sx={{ pl: 2 }}>
                                                <Controller
                                                    name="creditcard"
                                                    control={props.control}
                                                    render={({ field: creditField }) => (
                                                        <RadioGroup {...creditField}>
                                                            {props.cards && props.cards.map((card, i) => (
                                                                <FormControlLabel
                                                                    key={i}
                                                                    value={card.creditcardId}
                                                                    control={<Radio />}
                                                                    sx={{ ml: 1 }}
                                                                    label={<Typography fontWeight="bold">カード番号{card.maskedCardNumber}</Typography>}
                                                                />
                                                            ))}
                                                            <Button
                                                                startIcon={<AddCard />}
                                                                sx={{
                                                                    border: '1px solid #ddd',
                                                                    fontWeight: 'bold',
                                                                    mr: 3,
                                                                    ml: 1,
                                                                    pl: 2,
                                                                    background: '#fff',
                                                                    borderRadius: 1,
                                                                    justifyContent: 'flex-start',
                                                                }}
                                                            >
                                                                新しいクレジットカードを登録する
                                                            </Button>
                                                            {props.error && <Typography sx={{ 'color': '#d32f2f', 'fontSize': '0.75rem', mt: 1, ml: 1 }}>{props.error.message}</Typography>}
                                                        </RadioGroup>
                                                    )}
                                                />
                                            </Box>
                                        </>
                                    )}
                                </>}
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
