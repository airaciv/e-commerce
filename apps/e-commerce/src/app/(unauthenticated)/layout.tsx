'use client';

import { redirect } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { GlobalStorageKey } from '../layout';
import { useLocalStorage, useMount } from 'react-use';

export default function UnauthenticatedLayout({ children }: PropsWithChildren) {
  const [token] = useLocalStorage(GlobalStorageKey.TOKEN);

  useMount(() => {
    if (token) {
      redirect(`/`);
    }
  });

  return <>{children}</>;
}
