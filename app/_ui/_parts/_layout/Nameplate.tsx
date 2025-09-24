import { Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { JSX, useEffect } from 'react';

import { getUserNameFetcher } from '@/app/_lib/getLoginUser/fetcher';
import { LoginUserResponse } from '@/app/_lib/getLoginUser/types';
import { AlertType } from '@/app/_types/enum';
import { QUERY_KEYS } from '@/app/_types/queryKeys';
import { ApiResponse } from '@/app/_types/types';
import { useSnackBar } from '@/app/_ui/snackBar/snackbarContext';

/**
 * ユーザー名コンポーネント
 * @returns {JSX.Element} JSX
 */
export const Nameplate = (): JSX.Element => {
    /* initialize
    ------------------------------------------------------------------ */
    const { openSnackbar } = useSnackBar();

    /* useQuery
    ------------------------------------------------------------------ */
    const { data: result, isError } = useQuery<ApiResponse<LoginUserResponse>>({
        queryKey: [QUERY_KEYS.USER_NAME_SEARCH_RESULT],
        queryFn: getUserNameFetcher,
        enabled: true,
        refetchOnWindowFocus: true, // window がフォーカスされたら再取得してくれる
    });

    /* useEffect
    ------------------------------------------------------------------ */
    useEffect(() => {
        if (!result) {
            return
        }
        if (!result.success) {
            openSnackbar(AlertType.WARNING, result.error.message);
            return;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [result]);

    /* JSX
        ------------------------------------------------------------------ */
    return (
        <>
            {result?.success && (
                <Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff' }}>
                    {result.data.userName} さま
                </Typography>
            )}
        </>
    );
};
