'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { JSX, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form-mui';

import { AlertType } from '@/app/_types/enum';
import { QUERY_KEYS } from '@/app/_lib/hooks/query/queryKeys';
import { ApiRequest, ApiResponse, SelectOption } from '@/app/_types/types';
import { Btn } from '@/app/_ui/components/atoms/Button';
import { InputItem } from '@/app/_ui/components/molecules/InputItem';
import { SelectItem } from '@/app/_ui/components/molecules/SelectItem';
import { useProcessing } from '@/app/_ui/state/processing/processingContext';
import { useSnackBar } from '@/app/_ui/state/snackBar/snackbarContext';
import { useApiMutation } from '@/app/_lib/hooks/query/useApiMutation';
import { useApiQuery } from '@/app/_lib/hooks/query/useApiQuery';

import { getEditProfileInitDataFetcher, updateProfileFetcher } from './_lib/fetcher';
import { UserBasicResult, UserProfileFormValues, UserProfileInitData, UserProfileSchema } from './_lib/types';

/**
 * 会員情報の変更Component
 * @returns {JSX.Element} JSX
 */
export const EditProfileComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();
  const { openSnackbar } = useSnackBar();
  const { openProcessing, closeProcessing } = useProcessing();

  /* useState - 初期表示情報
  ------------------------------------------------------------------ */
  const [departmentOptions, setDepartmentOptions] = useState<SelectOption[]>([{ id: '', label: '' }]);
  const [employmentStatusOptions, setEmploymentStatusOptions] = useState<SelectOption[]>([{ id: '', label: '' }]);

  /* useForm
  ------------------------------------------------------------------ */
  const { handleSubmit, control, reset } = useForm<UserProfileFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
    resolver: zodResolver(UserProfileSchema),
    defaultValues: {
      user_name: '',
      user_name_kana: '',
      t_companies_department_id: '0',
      t_companies_employment_status_id: '0',
      optional_item_answer_1: '',
      optional_item_answer_2: '',
    },
  });

  /* useQuery - 初期表示情報取得
  ------------------------------------------------------------------ */
  const UpdateProfileInitDataFetch = async () => {
    const req: ApiRequest<null> = { request: null };
    return getEditProfileInitDataFetcher(req);
  };

  const { data, isLoading, refetch } = useApiQuery<UserProfileInitData>({
    queryKey: [QUERY_KEYS.COMPANY_SEARCH_RESULT],
    queryFn: UpdateProfileInitDataFetch,
    // enabled: false,
  });

  /* useEffect
  ------------------------------------------------------------------ */
  /** 初期表示情報取得 */
  useEffect(() => {
    if (!data) {
      return;
    } else {
      setDepartmentOptions(data.departmentOptions);
      setEmploymentStatusOptions(data.employmentStatusOptions);
      reset({
        ...data,
        t_companies_department_id: data.t_companies_department_id.toString(),
        t_companies_employment_status_id: data.t_companies_employment_status_id.toString()
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (isLoading) {
      openProcessing();
    } else {
      closeProcessing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  /* functions - 会員情報の更新
  ------------------------------------------------------------------ */
  const updateProfileHandler: SubmitHandler<UserProfileFormValues> = async (data) => {
    insertUserBasicMutate.mutate(data);
  };

  const insertUserBasicMutate = useApiMutation({
    mutationFn: async (data: UserProfileFormValues) => {
      openProcessing();
      const req: ApiRequest<UserProfileFormValues> = { request: data };
      return updateProfileFetcher(req) as unknown as ApiResponse<UserBasicResult>;
    },
    onSuccess: () => {
      refetch();
      openSnackbar(AlertType.SUCCESS, '会員情報を更新しました。');
    },
    onSettled: () => {
      closeProcessing();
    },
  });

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      <Box sx={{ pb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: 20 }}>
            会員情報の変更
          </Typography>
        </Box>
        {/* <Typography variant='body1'>会員登録に必要な情報をご入力・ご選択ください。</Typography> */}
        {!isLoading && data &&
          <Box sx={{ mt: 2 }}>
            <form onSubmit={handleSubmit(updateProfileHandler)}>
              <InputItem control={control} label={`会社名`} name="cname" disabled={true} isNotFormValue={"株式会社リファクト"} type="text" />
              <InputItem control={control} label={`支店名`} name="cname" disabled={true} isNotFormValue={"第一システム開発本部"} type="text" />
              <InputItem control={control} label={`登録メールアドレス`} name="cname" disabled={true} isNotFormValue={"s.abe@refact.co.jp"} type="text" />
              <InputItem control={control} label={`お名前`} name="user_name" required={true} />
              <InputItem
                control={control}
                label={`お名前（フリガナ）`}
                name="user_name_kana"
                required={true}
              />
              <SelectItem
                control={control}
                label={`部署`}
                name="t_companies_department_id"
                required={true}
                options={departmentOptions}
              />
              <SelectItem
                control={control}
                label={`雇用形態`}
                name="t_companies_employment_status_id"
                required={true}
                options={employmentStatusOptions}
              />
              <InputItem
                control={control}
                label={`会社任意の情報1`}
                name="optional_item_answer_1"
                note={'※任意情報'}
              />
              <InputItem
                control={control}
                label={`会社任意の情報2`}
                name="optional_item_answer_2"
                note={'※任意情報'}
              />
              {/* 変更ボタン */}
              <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                <Btn label={'変更'} isSubmit={true} />
              </Box>
            </form>
          </Box>
        }
      </Box>
    </>
  );
};
