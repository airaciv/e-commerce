import { useLocalStorage } from 'react-use';
import { GlobalStorageKey } from '../../layout';

// Ideally, we should be able to get user data from the auth token instead of saving it in local storage
export function useCurrentUser() {
  const [userId] = useLocalStorage<number>(GlobalStorageKey.USER_ID);
  if (!userId) {
    throw new Error('User ID not found');
  }

  return userId;
}
