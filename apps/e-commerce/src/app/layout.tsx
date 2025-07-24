'use client';

import { useEffect, useState } from 'react';
import './global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Container } from '@mui/material';

export enum GlobalStorageKey {
  TOKEN = 'token',
  USER_ID = 'userId',
}

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    setHasInitialized(true);
  }, []);

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <Container component="main" sx={{ height: '100%' }}>
            {hasInitialized && children}
          </Container>
        </QueryClientProvider>
      </body>
    </html>
  );
}
