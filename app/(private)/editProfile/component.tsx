'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { JSX, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form-mui';

import { AlertType } from '@/app/_types/enum';
import { QUERY_KEYS } from '@/app/_types/queryKeys';
import { ApiRequest, ApiResponse, SelectOption } from '@/app/_types/types';
import { Btn } from '@/app/_ui/_parts/Btn';
import { Inputitem } from '@/app/_ui/_parts/Inputitem';
import { SelectItem } from '@/app/_ui/_parts/Selectitem';
import { useProcessing } from '@/app/_ui/processing/processingContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

import { getUpdateProfileInitData, updateProfile } from './_lib/fetcher';
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

  const id: number = 1; //TODO:userParamsから取得した会社IDに差し替え

  /* useState - モーダル開閉
  ------------------------------------------------------------------ */
  const [openTerms, setOpenTerms] = useState<boolean>(false);
  const [openPrivacypolicy, setOpenPrivacypolicy] = useState<boolean>(false);
  /* useState - 初期表示情報
  ------------------------------------------------------------------ */
  const [departmentOptions, setDepartmentOptions] = useState<SelectOption[]>([{ id: '', label: '' }]);
  const [employmentStatusOptions, setEmploymentStatusOptions] = useState<SelectOption[]>([{ id: '', label: '' }]);
  /* useState - 登録結果
  ------------------------------------------------------------------ */
  const [IsCompleted, setIsCompleted] = useState<boolean>(false);
  const [isCompanyDomain, setIsCompanyDomain] = useState<boolean>(false);

  /* useForm
  ------------------------------------------------------------------ */
  const { handleSubmit, control } = useForm<UserProfileFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
    resolver: zodResolver(UserProfileSchema),
    defaultValues: {
      user_name: '',
      user_name_kana: '',
      t_companies_department_id: '',
      t_companies_employment_status_id: '',
      optional_item_answer_1: '',
      optional_item_answer_2: '',
      user_email: '',
      signup_password: '',
      confirm_signup_password: '',
    },
  });

  /* useQuery - 初期表示情報取得
  ------------------------------------------------------------------ */
  const UpdateProfileInitDataFetch = async () => {
    const req: ApiRequest<null> = { request: null };
    return getUpdateProfileInitData(req);
  };

  const { data: result, isLoading } = useQuery<ApiResponse<UserProfileInitData>>({
    queryKey: [QUERY_KEYS.COMPANY_SEARCH_RESULT],
    queryFn: UpdateProfileInitDataFetch,
    enabled: false,
  });

  /* useEffect
  ------------------------------------------------------------------ */
  /** 初期表示情報取得 */
  useEffect(() => {
    if (!result) {
      return;
    }
    if (!result.success) {
      openSnackbar(AlertType.WARNING, result.error.message);
      router.push('/login');
    } else if (result.data) {
      setDepartmentOptions(result.data.departmentOptions);
      setEmploymentStatusOptions(result.data.employmentStatusOptions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  /* functions - 会員情報の更新
  ------------------------------------------------------------------ */
  const updateProfileHandler: SubmitHandler<UserProfileFormValues> = async (data) => {
    insertUserBasicMutate.mutate(data);
  };

  const insertUserBasicMutate = useMutation({
    mutationFn: async (data: UserProfileFormValues) => {
      openProcessing();
      const req: ApiRequest<UserProfileFormValues> = { request: data };
      return updateProfile(req) as unknown as ApiResponse<UserBasicResult>;
    },
    onSuccess: (res) => {
      if (res.success) {
        setIsCompleted(true);
        setIsCompanyDomain(res.data.isCompanyDomain);
      } else {
        openSnackbar(AlertType.ERROR, res.error.message);
      }
    },
    onError: (e) => {
      console.log(e.message);
      openSnackbar(AlertType.ERROR, '会員情報の更新に失敗しました。再度お試しください。');
    },
    onSettled: () => {
      closeProcessing();
    },
  });

  /* functions
  ------------------------------------------------------------------ */
  const openTermsHandler = () => {
    setOpenTerms(true);
  };

  const openPrivacypolicyHandler = () => {
    setOpenPrivacypolicy(true);
  };

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      <Box sx={{ pb: 8 }}>
        {/* 仮登録前 */}
        {!IsCompleted ? (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: 20 }}>
                会員情報の変更
              </Typography>
            </Box>
            {/* <Typography variant='body1'>会員登録に必要な情報をご入力・ご選択ください。</Typography> */}
            <Box sx={{ mt: 2 }}>
              <form onSubmit={handleSubmit(updateProfileHandler)}>
                <Inputitem control={control} label={`会社名`} name="cname" disabled={true} type="text" />
                <Inputitem control={control} label={`支店名`} name="cname" disabled={true} type="text" />
                <Inputitem control={control} label={`お名前`} name="user_name" required={true} />
                <Inputitem
                  control={control}
                  label={`お名前（フリガナ）`}
                  name="user_name_kana"
                  disabled={false}
                  required={true}
                />
                <SelectItem
                  control={control}
                  label={`部署`}
                  name="t_companies_department_id"
                  required={true}
                  options={[
                    { id: '', label: '未選択' },
                    { id: '1', label: '第一システム開発部' },
                    { id: '2', label: '第二システム開発部' },
                    { id: '3', label: '管理部' },
                  ]}
                  // options={departmentOptions}
                />
                <SelectItem
                  control={control}
                  label={`雇用形態`}
                  name="t_companies_employment_status_id"
                  required={true}
                  options={[
                    { id: '', label: '未選択' },
                    { id: '1', label: '正社員' },
                    { id: '2', label: '準社員' },
                    { id: '3', label: 'パート・アルバイト' },
                  ]}
                  // options={employmentStatusOptions}
                />
                <Inputitem
                  control={control}
                  label={`会社任意の情報1`}
                  name="optional_item_answer_1"
                  note={'※任意情報'}
                />
                <Inputitem
                  control={control}
                  label={`会社任意の情報2`}
                  name="optional_item_answer_2"
                  note={'※任意情報'}
                />
                <Inputitem
                  control={control}
                  label={`メールアドレス`}
                  name="user_email"
                  disabled={false}
                  required={true}
                  type="mail"
                  note={'※会社ドメインと異なる場合は管理者の承認が必要となります。'}
                />
                <Inputitem
                  control={control}
                  label={`パスワード`}
                  annotation="※8文字以上、英数字の組み合わせ"
                  name="signup_password"
                  disabled={false}
                  required={true}
                  type="password"
                />
                <Inputitem
                  control={control}
                  label={`確認のためパスワードを再入力してください`}
                  name="confirm_signup_password"
                  disabled={false}
                  required={true}
                  type="password"
                />
                {/* 変更ボタン */}
                <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                  <Btn label={'変更'} isSubmit={true} />
                </Box>
              </form>
            </Box>
          </>
        ) : (
          <>
            {/* 仮登録完了時 */}
            {isCompanyDomain ? (
              <>
                {/* 仮登録完了時 -会社ドメインの場合 */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" textAlign={'center'} sx={{ fontWeight: 'bold', fontSize: 20 }}>
                    確認メールを送信しました
                  </Typography>
                  <Typography variant="subtitle1" textAlign={'center'} sx={{ fontWeight: 'bold', fontSize: 20 }}>
                    （※まだ会員登録は完了しておりません）
                  </Typography>
                  <br />
                  <Typography variant="body1">
                    ご登録いただいたメールアドレス宛に、確認メールを送信いたしました。
                  </Typography>
                  <Typography variant="body1">
                    メールに記載されているURLにアクセスし、認証手続きを行っていただくことで、本登録が完了します。
                  </Typography>
                  <Typography variant="body1">
                    お手数ですが、確認メールをご確認のうえ、認証手続きをお願いいたします。
                  </Typography>
                  <br />
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    ■確認メールが届かない場合
                  </Typography>
                  <Typography variant="body1">以下の原因が考えられます：</Typography>
                  <br />
                  <Typography variant="body1">・ご入力いただいたメールアドレスに誤りがある</Typography>
                  <Typography variant="body1">・メールが迷惑メールフォルダに振り分けられている</Typography>
                  <br />
                  <Typography variant="body1">上記をご確認のうえ、対応をお願いいたします。</Typography>
                  <br />
                  <Typography variant="body1">
                    ※30分以上経っても確認メールが届かない場合は、お手数ですが管理者までお問い合わせください。
                  </Typography>
                </Box>
              </>
            ) : (
              <>
                {/* 仮登録完了時 -会社ドメイン以外の場合 */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" textAlign={'center'} sx={{ fontWeight: 'bold', fontSize: 20 }}>
                    仮登録が完了しました
                  </Typography>
                  <Typography variant="subtitle1" textAlign={'center'} sx={{ fontWeight: 'bold', fontSize: 20 }}>
                    （※まだ会員登録は完了しておりません）
                  </Typography>
                  <br />
                  <Typography variant="body1">
                    ご登録いただいたメールアドレスが、会社ドメイン以外のアドレス（例：Gmail、Yahooメールなど）であったため、現在、
                    <Box component="span" sx={{ color: '#ea5315' }}>
                      管理者による承認待ち
                    </Box>
                    の状態となっております。
                  </Typography>
                  <Typography variant="body1">管理者による承認が完了次第、確認メールを送信いたします。</Typography>
                  <Typography variant="body1">
                    メールに記載されているURLにアクセスし、認証手続きを行っていただくことで、本登録が完了します。
                  </Typography>
                  <br />
                  <Typography variant="body1">
                    お手数をおかけいたしますが、管理者の承認完了まで、今しばらくお待ちくださいますようお願いいたします。
                  </Typography>
                </Box>
              </>
            )}
          </>
        )}
      </Box>
    </>
  );
};
