'use client';

import { superstructResolver } from '@hookform/resolvers/superstruct';
import { Button } from '@mui/material';
import { SubmitHandler, useForm } from 'react-hook-form';
import { object, pattern, size, string, Struct } from 'superstruct';
import { FormContainer, FormTextField } from '@bosshire-test/components';
import { message } from '@bosshire-test/core';
import { useUsersServicePostUsers } from '../../_core/openapi/queries';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from 'react-use';
import { GlobalStorageKey, useAppContext } from '../../_core/layout/AppContext';

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const registerSchema: Struct<RegisterPayload> = object({
  username: message(
    size(string(), 8, 20),
    'Please fill this field with 8-20 characters'
  ),
  email: message(
    pattern(string(), /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
    'Please input a valid email.'
  ),
  password: message(
    size(string(), 8, 20),
    'Please fill this field with 8-20 characters'
  ),
  confirmPassword: message(
    size(string(), 8, 20),
    'Please fill this field with 8-20 characters'
  ),
});

export default function RegisterPage() {
  const { toast } = useAppContext();
  const router = useRouter();
  const [_token, setToken] = useLocalStorage(GlobalStorageKey.TOKEN);
  const [_userId, setUserId] = useLocalStorage(GlobalStorageKey.USER_ID);

  const { mutate, isPending } = useUsersServicePostUsers({
    onError: () => {
      toast('Registration failed.', {
        severity: 'error',
      });
    },
    onSuccess: (data) => {
      if (!data.id) {
        toast('Registration failed.', {
          severity: 'error',
        });
        return;
      }

      // add user api only returns id, hence use id as token replacement
      setToken(data.id);
      setUserId(data.id);
      toast('Registration successful');
      router.push('/');
    },
  });

  const formContext = useForm<RegisterPayload>({
    resolver: superstructResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  const { setError } = formContext;

  const onSubmit: SubmitHandler<RegisterPayload> = async ({
    password,
    confirmPassword,
    ...restInput
  }) => {
    if (password !== confirmPassword) {
      setError('confirmPassword', {
        message: 'Passwords do not match.',
      });

      return;
    }

    mutate({ requestBody: { password, ...restInput } });
  };

  return (
    <div className="h-full flex items-center justify-center">
      <FormContainer
        formContext={formContext}
        onSuccess={onSubmit}
        FormProps={{ className: 'flex flex-col gap-4 md:w-1/3 w-full' }}
      >
        <div className="text-2xl">Signup</div>
        <FormTextField name="username" label="Username" />
        <FormTextField name="email" label="Email" />
        <FormTextField name="password" label="Password" type="password" />
        <FormTextField
          name="confirmPassword"
          label="Confirm Password"
          type="password"
        />
        <Button variant="contained" loading={isPending} type="submit">
          Signup
        </Button>
      </FormContainer>
    </div>
  );
}
