import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { certificateApi } from '../api/certificate.api';

export function useMyCertificates() {
  return useQuery({
    queryKey: ['certificates', 'mine'],
    queryFn: () => certificateApi.listMine(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useIssueCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attemptId: string) => certificateApi.issue(attemptId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
}

export function useVerifyCertificate(hash: string | undefined) {
  return useQuery({
    queryKey: ['certificates', 'verify', hash],
    queryFn: () => certificateApi.verify(hash!),
    enabled: !!hash,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}
