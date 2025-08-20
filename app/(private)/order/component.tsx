'use client';
import { useRouter } from 'next/navigation';
import { JSX, useState } from 'react';

import MenuCard from '@/app/_ui/_parts/MenuCard';
import MenuCardConfirm from '@/app/_ui/_parts/MenuCardConfirm';
import MenuCardNone from '@/app/_ui/_parts/MenuCardNone';
import { MenuDateNavigation } from '@/app/_ui/_parts/MenuDateNavigation';
import { useProcessing } from '@/app/_ui/processing/processingContext';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

/* ページ名 */
const pageName = '注文';
/* 明細行ヘッダー */

/**
 * 会社一覧Component
 * @returns {JSX.Element} JSX
 */
export const OrderComponent = (): JSX.Element => {
  /* initialize
  ------------------------------------------------------------------ */
  const router = useRouter();
  const { openSnackbar } = useSnackBar();
  const { openProcessing, closeProcessing } = useProcessing();

  /* useState
  ------------------------------------------------------------------ */

  const [open, setOpen] = useState<boolean>(false);
  /* useEffect
  ------------------------------------------------------------------ */
  /* mockData ※のちすて
  ------------------------------------------------------------------ */
  const menuDate: string = '5月23日（金）';

  /* JSX
  ------------------------------------------------------------------ */
  return (
    <>
      {/* 日付ナビゲーション */}
      <MenuDateNavigation menuDate={menuDate} />
      <MenuCard orderhandler={() => setOpen(true)} />
      <MenuCardNone />
      <MenuCardConfirm />
      {open ? <></> : <></>}
    </>
  );
};
