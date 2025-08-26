'use client';

import { superstructResolver } from '@hookform/resolvers/superstruct';
import { Button, Link } from '@mui/material';
import { SubmitHandler, useForm } from 'react-hook-form';
import { object, size, string, Struct } from 'superstruct';
import { FormContainer, FormTextField } from '@bosshire-test/components';
import { message } from '@bosshire-test/core';
import { useAuthServicePostAuthLogin } from '../../_core/openapi/queries';
import { useRouter } from 'next/navigation';
import { ApiError } from '../../_core/openapi/requests';
import { useLocalStorage } from 'react-use';
import { GlobalStorageKey, useAppContext } from '../../_core/layout/AppContext';

interface LoginPayload {
  username: string;
  password: string;
}

const loginSchema: Struct<LoginPayload> = object({
  username: message(
    size(string(), 8, 20),
    'Please fill this field with 8-20 characters'
  ),
  password: message(
    size(string(), 8, 20),
    'Please fill this field with 8-20 characters'
  ),
});

export default function LoginPage() {
  const { toast } = useAppContext();
  const router = useRouter();
  const [_token, setToken] = useLocalStorage(GlobalStorageKey.TOKEN);

  const { mutate, isPending } = useAuthServicePostAuthLogin({
    onError: (error: ApiError) => {
      toast(`Login failed. ${error.body}`, {
        severity: 'error',
      });
    },
    onSuccess: ({ token }) => {
      if (!token) {
        toast('Login failed.', {
          severity: 'error',
        });
        return;
      }

      setToken(token);
      toast('Login successful');
      router.push('/');
    },
  });

  const formContext = useForm<LoginPayload>({
    resolver: superstructResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<LoginPayload> = async (input) => {
    mutate({ requestBody: input });
  };

  return (
    <div className="h-full flex items-center justify-center">
      <FormContainer
        formContext={formContext}
        onSuccess={onSubmit}
        FormProps={{ className: 'flex flex-col gap-4 md:w-1/3 w-full' }}
      >
        <div className="text-2xl">Login</div>
        <FormTextField name="username" label="Username" />
        <FormTextField name="password" label="Password" type="password" />
        <Button variant="contained" loading={isPending} type="submit">
          Login
        </Button>

        <div className="self-center">
          Don&apos;t have an account? <Link href="/register">Signup</Link>
        </div>
      </FormContainer>
    </div>
  );
}
