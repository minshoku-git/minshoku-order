import { QUERY_KEYS } from '@/app/_types/queryKeys';
import { ApiRequest } from '@/app/_types/types';

import { useApiQuery } from '../../tanstackQuery/useApiQuery';
import { SessionStatusfetcher } from './fetcher';
import { AuthContextResponse } from './types';

const UpdateProfileInitDataFetch = async () => {
  const req: ApiRequest<null> = { request: null };
  return SessionStatusfetcher(req);
};

const { data, isLoading, refetch } = useApiQuery<AuthContextResponse>({
  queryKey: [QUERY_KEYS.COMPANY_SEARCH_RESULT],
  queryFn: UpdateProfileInitDataFetch,
  // enabled: false,
});
