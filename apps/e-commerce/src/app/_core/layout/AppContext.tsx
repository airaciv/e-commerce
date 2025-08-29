'use client';

import {
  createContext,
  memo,
  PropsWithChildren,
  useContext,
  useState,
} from 'react';
import { Alert, AlertProps, Snackbar } from '@mui/material';

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

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = memo(function AppContextProvider({
  children,
}: PropsWithChildren) {
  const [toastProp, setToastProp] = useState<{
    message: string;
    options?: ToastOptions;
  }>({ message: '' });

  return (
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
  );
});
