'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { JSX, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { TextareaAutosizeElement } from 'react-hook-form-mui';

import { AlertType } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import ConfirmDialog from '@/app/_ui/dirty/conformDialog';
import { useProcessing } from '@/app/_ui/processing/processingContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

import { Btn } from '../../_ui/_parts/Btn';
import { sendContact } from './_lib/fetcher';
import { ContactFormValues, ContactSchema } from './_lib/types';

/**
 * お問合せComponent
 * @returns {JSX.Element} JSX
 */
export const ContactComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();
  const { openSnackbar } = useSnackBar();
  const { openProcessing, closeProcessing } = useProcessing();

  /* useState
  ------------------------------------------------------------------ */
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>('');
  const [dialogActionHandler, setDialogActionHandler] = useState<() => void>(() => {
    return () => { };
  });

  /* useForm
  ------------------------------------------------------------------ */
  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<ContactFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(ContactSchema),
    defaultValues: { mainText: '' },
  });

  /* functions - 送信
   ------------------------------------------------------------------ */
  const sendMutateHandler: SubmitHandler<ContactFormValues> = async (data) => {
    insertMutate.mutate(data);
  };

  const insertMutate = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      openProcessing();
      const req: ApiRequest<ContactFormValues> = { request: data };
      return sendContact(req) as unknown as ApiResponse<null>;
    },
    onSuccess: (res) => {
      if (res.success) {
        openSnackbar(AlertType.SUCCESS, '問い合わせを送信しました。');
        router.push(`/companyDetail/${res.data}`);
      } else {
        openSnackbar(AlertType.ERROR, res.error.message);
      }
    },
    onError: (e) => {
      console.log(e.message);
      openSnackbar(AlertType.ERROR, '問い合わせの送信に失敗しました。再度お試しください。');
    },
    onSettled: () => {
      closeProcessing();
    },
  });

  const sendHandler = () => {
    // dialog setting
    setDialogMessage(`問い合わせ内容を送信します。\nよろしいですか？`);
    setDialogActionHandler(() => sendMutateHandler);
    setOpenDialog(true);
  };

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      {/* ステータス変更確認ダイアログ */}
      <ConfirmDialog
        open={openDialog}
        routerPush={dialogActionHandler}
        closeConform={() => setOpenDialog(false)}
        title={'送信確認'}
        message={dialogMessage}
      />
      {/* MainContents */}
      <Box sx={{ pb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            お問い合わせ
          </Typography>
        </Box>
        {true ? (
          <>
            {/* 送信前 */}
            <Typography variant="body1">
              下記のフォームにお問い合わせ内容をご記入の上、送信ボタンを押してください。<br></br>
              3営業日以内に担当者より返信いたします。
            </Typography>
            <Box sx={{ mt: 2 }}>
              <form onSubmit={handleSubmit(sendHandler)}>
                {/* 問い合わせ内容 */}
                <TextareaAutosizeElement
                  control={control}
                  name={'mainText'}
                  minRows={6}
                  fullWidth
                  style={{ maxWidth: '640px' }}
                />
                {/* 送信ボタン */}
                <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                  <Btn label={'送信'} eventhandler={() => { }} isSubmit={true} />
                </Box>
              </form>
            </Box>
          </>
        ) : (
          <>
            {/* 送信後 */}
            <Typography variant="body1">
              問い合わせ内容を送信しました。<br></br>3営業日以内に担当者より返信いたします。
            </Typography>
          </>
        )}
      </Box>
    </>
  );
};
