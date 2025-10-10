'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Fade, Typography } from '@mui/material';
import { JSX, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { TextareaAutosizeElement } from 'react-hook-form-mui';

import { useApiMutation } from '@/app/_lib/hooks/query/useApiMutation';
import { AlertType } from '@/app/_types/enum';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import ConfirmDialog from '@/app/_ui/state/dirty/conformDialog';
import { useProcessing } from '@/app/_ui/state/processing/processingContext';
import { useSnackBar } from '@/app/_ui/state/snackBar/snackbarContext';

import { Btn } from '../../_ui/components/atoms/Button';
import { sendContactFetcher } from './_lib/fetcher';
import { ContactFormValues, ContactSchema } from './_lib/types';

/**
 * お問合せComponent
 * @returns {JSX.Element} JSX
 */
export const ContactComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const { openSnackbar } = useSnackBar();
  const { openProcessing, closeProcessing } = useProcessing();

  /* useState
  ------------------------------------------------------------------ */
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>('');
  const [dialogActionHandler, setDialogActionHandler] = useState<() => void>(() => {
    return () => { };
  });
  const [isSent, setIsSent] = useState<boolean>(false);

  const [isMounted, setIsMounted] = useState<boolean>(false); // 🚨 追加

  /* useEffect でマウントを検出 */
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    defaultValues: { contactMessage: '' },
  });

  /* functions - 送信
   ------------------------------------------------------------------ */
  const sendMutateHandler = async (data: ContactFormValues) => {
    insertMutate.mutate(data);
  };

  const insertMutate = useApiMutation({
    mutationFn: async (data: ContactFormValues) => {
      openProcessing();
      const req: ApiRequest<ContactFormValues> = { request: data };
      return sendContactFetcher(req) as unknown as ApiResponse<null>;
    },
    onSuccess: () => {
      openSnackbar(AlertType.SUCCESS, '問い合わせが完了しました。');
      setIsSent(true);

    },
    onSettled: () => {
      closeProcessing();
    },
  });

  const sendHandler: SubmitHandler<ContactFormValues> = async (data) => {
    // dialog setting
    setDialogMessage(`問い合わせ内容を送信します。\nよろしいですか？`);
    setDialogActionHandler(() => () => sendMutateHandler(data));
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
      <Fade in={isMounted} timeout={500} unmountOnExit>
        <Box sx={{ pb: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: 20 }}>
              お問い合わせ
            </Typography>
          </Box>
          {!isSent ? (
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
                    name={'contactMessage'}
                    minRows={6}
                    fullWidth
                  />
                  {/* 送信ボタン */}
                  <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                    <Btn label={'送信'} isSubmit={true} isDisabled={!isDirty} />
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
      </Fade>
    </>
  );
};
