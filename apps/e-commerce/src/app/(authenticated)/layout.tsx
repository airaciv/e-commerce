'use client';

import { redirect } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';
import { GlobalStorageKey } from '../layout';
import { AppBar, Button, Container } from '@mui/material';

export default function AuthenticatedLayout({ children }: PropsWithChildren) {
  useEffect(() => {
    const token = window.localStorage[GlobalStorageKey.TOKEN];

    if (!token) {
      redirect(`/login`);
    }
  }, []);

  return (
    <>
      <AppBar position="static" color="transparent">
        <Container>
          <div className="h-16 flex items-center justify-between">
            <div className="text-2xl">Carts</div>
            <Button href="/logout">Logout</Button>
          </div>
        </Container>
      </AppBar>

      <Container component="main">{children}</Container>
    </>
  );
}
