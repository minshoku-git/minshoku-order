'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography } from '@mui/material';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { JSX, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form-mui';

import { QUERY_KEYS } from '@/app/_lib/hooks/query/queryKeys';
import { useApiMutation } from '@/app/_lib/hooks/query/useApiMutation';
import { useApiQuery } from '@/app/_lib/hooks/query/useApiQuery';
import { ApiRequest, ApiResponse } from '@/app/_types/types';
import { Btn } from '@/app/_ui/components/atoms/Button';
import { InputItem } from '@/app/_ui/components/molecules/InputItem';
import { SelectItem } from '@/app/_ui/components/molecules/SelectItem';
import UserCustomModal from '@/app/_ui/components/organisms/UserCustomModal';
import { useProcessing } from '@/app/_ui/state/processing/processingContext';

import { SignUpFetcher, SignUpInitDataFetcher } from './_lib/fetcher';
import { TermsComponent } from './_lib/terms';
import {
  SignUpFormValues,
  SignUpInitData,
  SignUpInitRequest,
  SignUpRequest,
  SignUpResponse,
  SignUpSchema,
} from './_lib/types';

/**
 * 新規会員登録Component
 * @returns {JSX.Element} JSX
 */
export const SignUpComponent = (): JSX.Element => {
  /* initComponenttialize
  ------------------------------------------------------------------ */
  const router = useRouter();
  const { openProcessing, closeProcessing } = useProcessing();
  const token = useParams().id?.toString() ?? '';

  /* useState - モーダル開閉
  ------------------------------------------------------------------ */
  const [openTerms, setOpenTerms] = useState<boolean>(false);
  const [openPrivacypolicy, setOpenPrivacypolicy] = useState<boolean>(false);
  /* useState - 初期表示情報
  ------------------------------------------------------------------ */
  const [initData, setInitData] = useState<SignUpInitData | null>();
  /* useState - 登録結果
  ------------------------------------------------------------------ */
  const [IsCompleted, setIsCompleted] = useState<boolean>(false);
  const [isCompanyDomain, setIsCompanyDomain] = useState<boolean>(false);

  /* useForm
  ------------------------------------------------------------------ */
  const { handleSubmit, control, getValues } = useForm<SignUpFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      user_name: '阿部沙友里',
      user_name_kana: 'アベサユリ',
      t_companies_department_id: '1',
      t_companies_employment_status_id: '1',
      optional_item_answer_1: 'はい',
      optional_item_answer_2: 'いいえ',
      user_email: 's.abe@refact.co.jp',
      signup_password: 'password1',
      confirm_signup_password: 'password1',
    },
    // defaultValues: {
    //   user_name: '',
    //   user_name_kana: '',
    //   t_companies_department_id: '',
    //   t_companies_employment_status_id: '',
    //   optional_item_answer_1: '',
    //   optional_item_answer_2: '',
    //   user_email: '',
    //   signup_password: '',
    //   confirm_signup_password: '',
    // },
  });

  /* useQuery - 初期表示情報取得
  ------------------------------------------------------------------ */
  const signUpInitDataFetch = async () => {
    const req: ApiRequest<SignUpInitRequest> = { request: { token: token } };
    return SignUpInitDataFetcher(req);
  };

  const { data, error, isLoading } = useApiQuery<SignUpInitData>({
    queryKey: [QUERY_KEYS.COMPANY_SEARCH_RESULT],
    queryFn: signUpInitDataFetch,
    refetchOnWindowFocus: false,
  });

  /* useEffect
  ------------------------------------------------------------------ */
  /** 初期表示情報取得 */
  useEffect(() => {
    if (data === undefined && error === null) {
      return;
    }
    if (error) {
      router.replace('/login');
      return;
    }
    setInitData(data)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, error]);

  useEffect(() => {
    if (isLoading) {
      openProcessing();
    } else {
      closeProcessing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  /* functions - Insert
  ------------------------------------------------------------------ */
  const signUpHandler: SubmitHandler<SignUpFormValues> = async (data) => {
    signUpMutate.mutate(data);
  };

  const signUpMutate = useApiMutation({
    mutationFn: async (data: SignUpFormValues) => {
      openProcessing();
      const req: ApiRequest<SignUpRequest> = { request: { ...data, token: token } };
      return SignUpFetcher(req) as unknown as ApiResponse<SignUpResponse>;
    },
    onSuccess: (res) => {
      setIsCompleted(true);
      setIsCompanyDomain(res.data.isCompanyDomain);
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

  const testHandler = () => {
    console.log('押下できています！')
  };

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      {/* 利用規約 */}
      <UserCustomModal open={openTerms} onClose={() => setOpenTerms(false)} title="利用規約">
        <TermsComponent />
      </UserCustomModal>
      {/* 利用規約 */}
      <UserCustomModal
        open={openPrivacypolicy}
        onClose={() => setOpenPrivacypolicy(false)}
        title="プライバシーポリシー"
      >
        <TermsComponent />
      </UserCustomModal>
      <Box sx={{ pb: 8 }}>
        {/* 仮登録前 */}
        {!IsCompleted ? (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: 20 }}>
                基本情報／新規会員登録
              </Typography>
            </Box>
            <Typography variant="body1">会員登録に必要な情報をご入力・ご選択ください。</Typography>
            {initData && <>
              <Box sx={{ mt: 2 }}>
                <form noValidate onSubmit={handleSubmit(signUpHandler)}>
                  <InputItem control={control} label={`会社名`} name="cname" disabled={true} isNotFormValue={initData.company_name} type="text" />
                  <InputItem control={control} label={`支店名`} name="cname" disabled={true} isNotFormValue={initData.branch_name} type="text" />
                  <InputItem control={control} label={`お名前`} name="user_name" required={true} />
                  <InputItem
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
                    options={initData.departmentOptions}
                  />
                  <SelectItem
                    control={control}
                    label={`雇用形態`}
                    name="t_companies_employment_status_id"
                    required={true}
                    options={initData.employmentStatusOptions}
                  />
                  {initData.optional_item_title_1 &&
                    <InputItem
                      control={control}
                      label={initData.optional_item_title_1}
                      name="optional_item_answer_1"
                      note={'※' + initData.optional_item_notes_1}
                    />
                  }
                  {initData.optional_item_title_2 &&
                    <InputItem
                      control={control}
                      label={initData.optional_item_title_2}
                      name="optional_item_answer_2"
                      note={'※' + initData.optional_item_notes_2}
                    />
                  }
                  <InputItem
                    control={control}
                    label={`メールアドレス`}
                    name="user_email"
                    disabled={false}
                    required={true}
                    type="mail"
                    note={'※会社ドメインと異なる場合は管理者の承認が必要となります。'}
                  />
                  <InputItem
                    control={control}
                    label={`パスワード`}
                    annotation=""
                    name="signup_password"
                    disabled={false}
                    required={true}
                    type="password"
                    note={'※8文字以上、英数字の組み合わせ'}
                  />
                  <InputItem
                    control={control}
                    label={`確認のためパスワードを再入力してください`}
                    name="confirm_signup_password"
                    disabled={false}
                    required={true}
                    type="password"
                  />
                  <Typography>
                    「仮登録」ボタンをクリックすることで、
                    <Link href={''} onClick={() => openTermsHandler()}>
                      「利用規約」
                    </Link>
                    と
                    <Link href={''} onClick={() => openPrivacypolicyHandler()}>
                      「プライバシーポリシー」
                    </Link>
                    に同意いただいたものとみなされます。ご登録のメールアドレス宛に送信される認証用リンクをクリックすることで、本登録が完了します。
                  </Typography>
                  {/* 仮登録ボタン */}
                  <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                    <Btn label={'仮登録'} isSubmit={true} />
                  </Box>
                  <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                    <Btn label={'戻る'} bgc={'#707070'} eventhandler={() => router.back()} />
                  </Box>
                </form>
              </Box>
            </>}
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
                    ご登録いただいたメールアドレス宛（{getValues('user_email')}）に、確認メールを送信いたしました。
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
                <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                  <Btn label={'戻る'} bgc={'#707070'} eventhandler={() => router.back()} />
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
                    ご登録いただいたメールアドレス（{getValues('user_email')}）が、会社ドメイン以外のアドレスであったため、現在、
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
                <Box display="flex" alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                  <Btn label={'戻る'} bgc={'#707070'} eventhandler={() => router.back()} />
                </Box>

              </>
            )}
          </>
        )}
      </Box>
    </>
  );
};
