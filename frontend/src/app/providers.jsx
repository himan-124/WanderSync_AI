import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center">Loading...</div>}>
        {children}
      </Suspense>
    </QueryClientProvider>
  );
}
