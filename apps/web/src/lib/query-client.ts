import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/api/client.js';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 min default
      retry: (failureCount, error) => {
        // Nao retenta erros 4xx (client errors: auth, not found, validation, etc.)
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
