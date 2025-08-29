'use client';

import { redirect } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { useLocalStorage, useMount } from 'react-use';
import { Container } from '@mui/material';
import { GlobalStorageKey } from '../_core/layout/AppContext';

export default function UnauthenticatedLayout({ children }: PropsWithChildren) {
  const [token] = useLocalStorage(GlobalStorageKey.TOKEN);

  useMount(() => {
    if (token) {
      redirect(`/`);
    }
  });

  return (
    <Container component="main" sx={{ height: '100%' }}>
      {children}
    </Container>
  );
}
