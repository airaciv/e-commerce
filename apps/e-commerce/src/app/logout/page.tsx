'use client';

import { useLocalStorage, useMount } from 'react-use';
import { GlobalStorageKey, useAppContext } from '../layout';
import { useRouter } from 'next/navigation';

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
