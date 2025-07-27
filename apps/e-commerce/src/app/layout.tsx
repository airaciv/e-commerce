'use client';

import { createContext, useContext, useState } from 'react';
import './global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Alert, AlertProps, Snackbar } from '@mui/material';
import { useMount } from 'react-use';
import { OpenAPI } from './_core/openapi/requests';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export enum GlobalStorageKey {
  TOKEN = 'token',
  USER_ID = 'userId',
}

interface ToastOptions {
  severity: AlertProps['severity'];
}
interface AppContext {
  toast: (message: string, options?: ToastOptions) => void;
}

const AppContext = createContext<AppContext>({
  toast: () => {
    return;
  },
});

const queryClient = new QueryClient();

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: import('@tanstack/query-core').QueryClient;
  }
}

window.__TANSTACK_QUERY_CLIENT__ = queryClient;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toastProp, setToastProp] = useState<{
    message: string;
    options?: ToastOptions;
  }>({ message: '' });

  useMount(() => {
    OpenAPI.interceptors.request.use((config) => {
      config.headers = {
        'Content-Type': 'application/json',
      };
      return config;
    });
  });

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <AppContext.Provider
              value={{
                toast: (message, options) => {
                  setToastProp({ message, options });
                },
              }}
            >
              <Snackbar
                open={!!toastProp.message}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                autoHideDuration={5000}
                onClose={() => setToastProp({ message: '' })}
              >
                <Alert severity={toastProp.options?.severity}>
                  {toastProp.message}
                </Alert>
              </Snackbar>

              {children}
            </AppContext.Provider>
          </LocalizationProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

export const useAppContext = () => useContext(AppContext);
