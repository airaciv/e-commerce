import { ErrorMessage } from '@hookform/error-message';
import { TextField, TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

export const FormTextField = ({
  name,
  ...props
}: Omit<
  TextFieldProps,
  'onChangeText' | 'onBlur' | 'value' | 'bottomAccessory'
> & { name: string }) => {
  const {
    formState: { errors },
  } = useFormContext();

  return (
    <Controller
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => {
        return (
          <div>
            <TextField
              {...props}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              fullWidth
            />
            <ErrorMessage
              errors={errors}
              name={name}
              render={({ message }) => (
                <p className="mt-1 text-xs text-red-600">{message}</p>
              )}
            />
          </div>
        );
      }}
    />
  );
};
