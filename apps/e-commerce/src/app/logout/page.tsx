'use client';

import { useLocalStorage, useMount } from 'react-use';
import { useRouter } from 'next/navigation';
import { GlobalStorageKey, useAppContext } from '../_core/layout/AppContext';

export default function LogoutPage() {
  const { toast } = useAppContext();
  const router = useRouter();
  const [_value, _setValue, remove] = useLocalStorage(GlobalStorageKey.TOKEN);

  useMount(() => {
    remove();
    toast('Logout successful');
    router.push('/login');
  });

  return null;
}
