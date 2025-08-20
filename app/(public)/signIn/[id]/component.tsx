'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { JSX, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form-mui';

import { AlertType } from '@/app/_types/enum';
import { QUERY_KEYS } from '@/app/_types/queryKeys';
import { ApiRequest, ApiResponse, SelectOption } from '@/app/_types/types';
import { Btn } from '@/app/_ui/_parts/Btn';
import { Inputitem } from '@/app/_ui/_parts/Inputitem';
import { SelectItem } from '@/app/_ui/_parts/Selectitem';
import UserCustomModal from '@/app/_ui/_parts/UserCustomModal';
import { useProcessing } from '@/app/_ui/processing/processingContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

import { getUserBasicInitData, insertUserBasic } from './_lib/fetcher';
import {
  UserBasicFormValues,
  UserBasicInitData,
  UserBasicInitRequest,
  UserBasicResult,
  UserBasicSchema,
} from './_lib/types';

/* ページ名 */
const pageName = '基本情報／新規会員登録';

/**
 * 基本情報／新規会員登録Component
 * @returns {JSX.Element} JSX
 */
export const BasicComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();
  const { openSnackbar } = useSnackBar();
  const { openProcessing, closeProcessing } = useProcessing();
  const token = useParams().id?.toString() ?? '';

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
  const [IsCompleted, setIsCompleted] = useState<boolean>(true);
  const [isCompanyDomain, setIsCompanyDomain] = useState<boolean>(false);

  /* useForm
  ------------------------------------------------------------------ */
  const { handleSubmit, control } = useForm<UserBasicFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
    resolver: zodResolver(UserBasicSchema),
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
  const userBasicInitDataFetch = async () => {
    const req: ApiRequest<UserBasicInitRequest> = { request: { token: token } };
    return getUserBasicInitData(req);
  };

  const { data: result, isLoading } = useQuery<ApiResponse<UserBasicInitData>>({
    queryKey: [QUERY_KEYS.COMPANY_SEARCH_RESULT],
    queryFn: userBasicInitDataFetch,
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

  /* functions - Insert
  ------------------------------------------------------------------ */
  const insertUserBasicHandler: SubmitHandler<UserBasicFormValues> = async (data) => {
    insertUserBasicMutate.mutate(data);
  };

  const insertUserBasicMutate = useMutation({
    mutationFn: async (data: UserBasicFormValues) => {
      openProcessing();
      const req: ApiRequest<UserBasicFormValues> = { request: data };
      return insertUserBasic(req) as unknown as ApiResponse<UserBasicResult>;
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
      openSnackbar(AlertType.ERROR, '仮登録に失敗しました。再度お試しください。');
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
      {/* 利用規約 */}
      <UserCustomModal open={openTerms} onClose={() => setOpenTerms(false)} title="利用規約">
        <Typography>
          {`
この利用規約（以下，「本規約」といいます。）は，＿＿＿＿＿（以下，「当社」といいます。）がこのウェブサイト上で提供するサービス（以下，「本サービス」といいます。）の利用条件を定めるものです。登録ユーザーの皆さま（以下，「ユーザー」といいます。）には，本規約に従って，本サービスをご利用いただきます。

第1条（適用）
本規約は，ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されるものとします。
当社は本サービスに関し，本規約のほか，ご利用にあたってのルール等，各種の定め（以下，「個別規定」といいます。）をすることがあります。これら個別規定はその名称のいかんに関わらず，本規約の一部を構成するものとします。
本規約の規定が前条の個別規定の規定と矛盾する場合には，個別規定において特段の定めなき限り，個別規定の規定が優先されるものとします。
第2条（利用登録）
本サービスにおいては，登録希望者が本規約に同意の上，当社の定める方法によって利用登録を申請し，当社がこれを承認することによって，利用登録が完了するものとします。
当社は，利用登録の申請者に以下の事由があると判断した場合，利用登録の申請を承認しないことがあり，その理由については一切の開示義務を負わないものとします。
利用登録の申請に際して虚偽の事項を届け出た場合
本規約に違反したことがある者からの申請である場合
その他，当社が利用登録を相当でないと判断した場合
第3条（ユーザーIDおよびパスワードの管理）
ユーザーは，自己の責任において，本サービスのユーザーIDおよびパスワードを適切に管理するものとします。
ユーザーは，いかなる場合にも，ユーザーIDおよびパスワードを第三者に譲渡または貸与し，もしくは第三者と共用することはできません。当社は，ユーザーIDとパスワードの組み合わせが登録情報と一致してログインされた場合には，そのユーザーIDを登録しているユーザー自身による利用とみなします。
ユーザーID及びパスワードが第三者によって使用されたことによって生じた損害は，当社に故意又は重大な過失がある場合を除き，当社は一切の責任を負わないものとします。
第4条（利用料金および支払方法）
ユーザーは，本サービスの有料部分の対価として，当社が別途定め，本ウェブサイトに表示する利用料金を，当社が指定する方法により支払うものとします。
ユーザーが利用料金の支払を遅滞した場合には，ユーザーは年14．6％の割合による遅延損害金を支払うものとします。
第5条（禁止事項）
ユーザーは，本サービスの利用にあたり，以下の行為をしてはなりません。

法令または公序良俗に違反する行為
犯罪行為に関連する行為
本サービスの内容等，本サービスに含まれる著作権，商標権ほか知的財産権を侵害する行為
当社，ほかのユーザー，またはその他第三者のサーバーまたはネットワークの機能を破壊したり，妨害したりする行為
本サービスによって得られた情報を商業的に利用する行為
当社のサービスの運営を妨害するおそれのある行為
不正アクセスをし，またはこれを試みる行為
他のユーザーに関する個人情報等を収集または蓄積する行為
不正な目的を持って本サービスを利用する行為
本サービスの他のユーザーまたはその他の第三者に不利益，損害，不快感を与える行為
他のユーザーに成りすます行為
当社が許諾しない本サービス上での宣伝，広告，勧誘，または営業行為
面識のない異性との出会いを目的とした行為
当社のサービスに関連して，反社会的勢力に対して直接または間接に利益を供与する行為
その他，当社が不適切と判断する行為
第6条（本サービスの提供の停止等）
当社は，以下のいずれかの事由があると判断した場合，ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
本サービスにかかるコンピュータシステムの保守点検または更新を行う場合
地震，落雷，火災，停電または天災などの不可抗力により，本サービスの提供が困難となった場合
コンピュータまたは通信回線等が事故により停止した場合
その他，当社が本サービスの提供が困難と判断した場合
当社は，本サービスの提供の停止または中断により，ユーザーまたは第三者が被ったいかなる不利益または損害についても，一切の責任を負わないものとします。
第7条（利用制限および登録抹消）
当社は，ユーザーが以下のいずれかに該当する場合には，事前の通知なく，ユーザーに対して，本サービスの全部もしくは一部の利用を制限し，またはユーザーとしての登録を抹消することができるものとします。
本規約のいずれかの条項に違反した場合
登録事項に虚偽の事実があることが判明した場合
料金等の支払債務の不履行があった場合
当社からの連絡に対し，一定期間返答がない場合
本サービスについて，最終の利用から一定期間利用がない場合
その他，当社が本サービスの利用を適当でないと判断した場合
当社は，本条に基づき当社が行った行為によりユーザーに生じた損害について，一切の責任を負いません。
第8条（退会）
ユーザーは，当社の定める退会手続により，本サービスから退会できるものとします。

第9条（保証の否認および免責事項）
当社は，本サービスに事実上または法律上の瑕疵（安全性，信頼性，正確性，完全性，有効性，特定の目的への適合性，セキュリティなどに関する欠陥，エラーやバグ，権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
当社は，本サービスに起因してユーザーに生じたあらゆる損害について、当社の故意又は重過失による場合を除き、一切の責任を負いません。ただし，本サービスに関する当社とユーザーとの間の契約（本規約を含みます。）が消費者契約法に定める消費者契約となる場合，この免責規定は適用されません。
前項ただし書に定める場合であっても，当社は，当社の過失（重過失を除きます。）による債務不履行または不法行為によりユーザーに生じた損害のうち特別な事情から生じた損害（当社またはユーザーが損害発生につき予見し，または予見し得た場合を含みます。）について一切の責任を負いません。また，当社の過失（重過失を除きます。）による債務不履行または不法行為によりユーザーに生じた損害の賠償は，ユーザーから当該損害が発生した月に受領した利用料の額を上限とします。
当社は，本サービスに関して，ユーザーと他のユーザーまたは第三者との間において生じた取引，連絡または紛争等について一切責任を負いません。
第10条（サービス内容の変更等）
当社は，ユーザーへの事前の告知をもって、本サービスの内容を変更、追加または廃止することがあり、ユーザーはこれを承諾するものとします。

第11条（利用規約の変更）
当社は以下の場合には、ユーザーの個別の同意を要せず、本規約を変更することができるものとします。
本規約の変更がユーザーの一般の利益に適合するとき。
本規約の変更が本サービス利用契約の目的に反せず、かつ、変更の必要性、変更後の内容の相当性その他の変更に係る事情に照らして合理的なものであるとき。
当社はユーザーに対し、前項による本規約の変更にあたり、事前に、本規約を変更する旨及び変更後の本規約の内容並びにその効力発生時期を通知します。
第12条（個人情報の取扱い）
当社は，本サービスの利用によって取得する個人情報については，当社「プライバシーポリシー」に従い適切に取り扱うものとします。

第13条（通知または連絡）
ユーザーと当社との間の通知または連絡は，当社の定める方法によって行うものとします。当社は,ユーザーから,当社が別途定める方式に従った変更届け出がない限り,現在登録されている連絡先が有効なものとみなして当該連絡先へ通知または連絡を行い,これらは,発信時にユーザーへ到達したものとみなします。

第14条（権利義務の譲渡の禁止）
ユーザーは，当社の書面による事前の承諾なく，利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し，または担保に供することはできません。

第15条（準拠法・裁判管轄）
本規約の解釈にあたっては，日本法を準拠法とします。
本サービスに関して紛争が生じた場合には，当社の本店所在地を管轄する裁判所を専属的合意管轄とします。
以上
          `}
        </Typography>
      </UserCustomModal>
      {/* 利用規約 */}
      <UserCustomModal
        open={openPrivacypolicy}
        onClose={() => setOpenPrivacypolicy(false)}
        title="プライバシーポリシー"
      >
        <Typography>
          {`
この利用規約（以下，「本規約」といいます。）は，＿＿＿＿＿（以下，「当社」といいます。）がこのウェブサイト上で提供するサービス（以下，「本サービス」といいます。）の利用条件を定めるものです。登録ユーザーの皆さま（以下，「ユーザー」といいます。）には，本規約に従って，本サービスをご利用いただきます。

第1条（適用）
本規約は，ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されるものとします。
当社は本サービスに関し，本規約のほか，ご利用にあたってのルール等，各種の定め（以下，「個別規定」といいます。）をすることがあります。これら個別規定はその名称のいかんに関わらず，本規約の一部を構成するものとします。
本規約の規定が前条の個別規定の規定と矛盾する場合には，個別規定において特段の定めなき限り，個別規定の規定が優先されるものとします。
第2条（利用登録）
本サービスにおいては，登録希望者が本規約に同意の上，当社の定める方法によって利用登録を申請し，当社がこれを承認することによって，利用登録が完了するものとします。
当社は，利用登録の申請者に以下の事由があると判断した場合，利用登録の申請を承認しないことがあり，その理由については一切の開示義務を負わないものとします。
利用登録の申請に際して虚偽の事項を届け出た場合
本規約に違反したことがある者からの申請である場合
その他，当社が利用登録を相当でないと判断した場合
第3条（ユーザーIDおよびパスワードの管理）
ユーザーは，自己の責任において，本サービスのユーザーIDおよびパスワードを適切に管理するものとします。
ユーザーは，いかなる場合にも，ユーザーIDおよびパスワードを第三者に譲渡または貸与し，もしくは第三者と共用することはできません。当社は，ユーザーIDとパスワードの組み合わせが登録情報と一致してログインされた場合には，そのユーザーIDを登録しているユーザー自身による利用とみなします。
ユーザーID及びパスワードが第三者によって使用されたことによって生じた損害は，当社に故意又は重大な過失がある場合を除き，当社は一切の責任を負わないものとします。
第4条（利用料金および支払方法）
ユーザーは，本サービスの有料部分の対価として，当社が別途定め，本ウェブサイトに表示する利用料金を，当社が指定する方法により支払うものとします。
ユーザーが利用料金の支払を遅滞した場合には，ユーザーは年14．6％の割合による遅延損害金を支払うものとします。
第5条（禁止事項）
ユーザーは，本サービスの利用にあたり，以下の行為をしてはなりません。

法令または公序良俗に違反する行為
犯罪行為に関連する行為
本サービスの内容等，本サービスに含まれる著作権，商標権ほか知的財産権を侵害する行為
当社，ほかのユーザー，またはその他第三者のサーバーまたはネットワークの機能を破壊したり，妨害したりする行為
本サービスによって得られた情報を商業的に利用する行為
当社のサービスの運営を妨害するおそれのある行為
不正アクセスをし，またはこれを試みる行為
他のユーザーに関する個人情報等を収集または蓄積する行為
不正な目的を持って本サービスを利用する行為
本サービスの他のユーザーまたはその他の第三者に不利益，損害，不快感を与える行為
他のユーザーに成りすます行為
当社が許諾しない本サービス上での宣伝，広告，勧誘，または営業行為
面識のない異性との出会いを目的とした行為
当社のサービスに関連して，反社会的勢力に対して直接または間接に利益を供与する行為
その他，当社が不適切と判断する行為
第6条（本サービスの提供の停止等）
当社は，以下のいずれかの事由があると判断した場合，ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
本サービスにかかるコンピュータシステムの保守点検または更新を行う場合
地震，落雷，火災，停電または天災などの不可抗力により，本サービスの提供が困難となった場合
コンピュータまたは通信回線等が事故により停止した場合
その他，当社が本サービスの提供が困難と判断した場合
当社は，本サービスの提供の停止または中断により，ユーザーまたは第三者が被ったいかなる不利益または損害についても，一切の責任を負わないものとします。
第7条（利用制限および登録抹消）
当社は，ユーザーが以下のいずれかに該当する場合には，事前の通知なく，ユーザーに対して，本サービスの全部もしくは一部の利用を制限し，またはユーザーとしての登録を抹消することができるものとします。
本規約のいずれかの条項に違反した場合
登録事項に虚偽の事実があることが判明した場合
料金等の支払債務の不履行があった場合
当社からの連絡に対し，一定期間返答がない場合
本サービスについて，最終の利用から一定期間利用がない場合
その他，当社が本サービスの利用を適当でないと判断した場合
当社は，本条に基づき当社が行った行為によりユーザーに生じた損害について，一切の責任を負いません。
第8条（退会）
ユーザーは，当社の定める退会手続により，本サービスから退会できるものとします。

第9条（保証の否認および免責事項）
当社は，本サービスに事実上または法律上の瑕疵（安全性，信頼性，正確性，完全性，有効性，特定の目的への適合性，セキュリティなどに関する欠陥，エラーやバグ，権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
当社は，本サービスに起因してユーザーに生じたあらゆる損害について、当社の故意又は重過失による場合を除き、一切の責任を負いません。ただし，本サービスに関する当社とユーザーとの間の契約（本規約を含みます。）が消費者契約法に定める消費者契約となる場合，この免責規定は適用されません。
前項ただし書に定める場合であっても，当社は，当社の過失（重過失を除きます。）による債務不履行または不法行為によりユーザーに生じた損害のうち特別な事情から生じた損害（当社またはユーザーが損害発生につき予見し，または予見し得た場合を含みます。）について一切の責任を負いません。また，当社の過失（重過失を除きます。）による債務不履行または不法行為によりユーザーに生じた損害の賠償は，ユーザーから当該損害が発生した月に受領した利用料の額を上限とします。
当社は，本サービスに関して，ユーザーと他のユーザーまたは第三者との間において生じた取引，連絡または紛争等について一切責任を負いません。
第10条（サービス内容の変更等）
当社は，ユーザーへの事前の告知をもって、本サービスの内容を変更、追加または廃止することがあり、ユーザーはこれを承諾するものとします。

第11条（利用規約の変更）
当社は以下の場合には、ユーザーの個別の同意を要せず、本規約を変更することができるものとします。
本規約の変更がユーザーの一般の利益に適合するとき。
本規約の変更が本サービス利用契約の目的に反せず、かつ、変更の必要性、変更後の内容の相当性その他の変更に係る事情に照らして合理的なものであるとき。
当社はユーザーに対し、前項による本規約の変更にあたり、事前に、本規約を変更する旨及び変更後の本規約の内容並びにその効力発生時期を通知します。
第12条（個人情報の取扱い）
当社は，本サービスの利用によって取得する個人情報については，当社「プライバシーポリシー」に従い適切に取り扱うものとします。

第13条（通知または連絡）
ユーザーと当社との間の通知または連絡は，当社の定める方法によって行うものとします。当社は,ユーザーから,当社が別途定める方式に従った変更届け出がない限り,現在登録されている連絡先が有効なものとみなして当該連絡先へ通知または連絡を行い,これらは,発信時にユーザーへ到達したものとみなします。

第14条（権利義務の譲渡の禁止）
ユーザーは，当社の書面による事前の承諾なく，利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し，または担保に供することはできません。

第15条（準拠法・裁判管轄）
本規約の解釈にあたっては，日本法を準拠法とします。
本サービスに関して紛争が生じた場合には，当社の本店所在地を管轄する裁判所を専属的合意管轄とします。
以上
          `}
        </Typography>
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
            <Box sx={{ mt: 2 }}>
              <form onSubmit={handleSubmit(insertUserBasicHandler)}>
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
