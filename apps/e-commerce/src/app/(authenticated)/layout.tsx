'use client';

import { redirect } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';
import { GlobalStorageKey } from '../layout';

export default function AuthenticatedLayout({ children }: PropsWithChildren) {
  useEffect(() => {
    const token = window.localStorage[GlobalStorageKey.TOKEN];

    if (!token) {
      redirect(`/login`);
    }
  }, []);

  return <>{children}</>;
}
