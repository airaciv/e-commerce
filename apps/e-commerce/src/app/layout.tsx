'use client';

import './global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMount } from 'react-use';
import { OpenAPI } from './_core/openapi/requests';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { AppContextProvider } from './_core/layout/AppContext';

const queryClient = new QueryClient();

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: import('@tanstack/query-core').QueryClient;
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useMount(() => {
    OpenAPI.interceptors.request.use((config) => {
      config.headers = {
        'Content-Type': 'application/json',
      };
      return config;
    });

    window.__TANSTACK_QUERY_CLIENT__ = queryClient;
  });

  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <QueryClientProvider client={queryClient}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <AppContextProvider>{children}</AppContextProvider>
            </LocalizationProvider>
          </QueryClientProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
