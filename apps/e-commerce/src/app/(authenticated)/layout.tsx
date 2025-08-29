'use client';

import { redirect, useRouter } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { useLocalStorage, useMount } from 'react-use';
import { AppBar, Button, Container } from '@mui/material';
import { GlobalStorageKey } from '../_core/layout/AppContext';

export default function AuthenticatedLayout({ children }: PropsWithChildren) {
  const [token] = useLocalStorage(GlobalStorageKey.TOKEN);
  const router = useRouter();

  useMount(() => {
    if (!token) {
      redirect(`/login`);
    }
  });

  if (!token) {
    return null;
  }

  return (
    <>
      <AppBar position="static" color="transparent">
        <Container>
          <div className="h-16 flex items-center justify-between">
            <div className="text-2xl">Carts</div>
            <Button onClick={() => router.push('/logout')}>Logout</Button>
          </div>
        </Container>
      </AppBar>

      <Container component="main" className="my-4">
        {children}
      </Container>
    </>
  );
}
