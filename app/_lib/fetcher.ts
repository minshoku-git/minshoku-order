export const fetcher = async <T>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  const res = await fetch(input, {
    ...init,
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('API Error!');
  }
  return res.json();
};
