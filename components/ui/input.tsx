'use client';
import React, { useState } from 'react';
import { useController, Control } from 'react-hook-form';
import { TextField, TextFieldProps } from '@mui/material';
import { cn } from '@utils/utils'; // Assuming you have a utility to join class names
import { Eye, EyeOff } from 'lucide-react'; // Importing eye icons from Lucide (you can replace it with any icon library)

export interface InputProps
  extends Omit<TextFieldProps, 'name' | 'value' | 'onChange' | 'onBlur'> {
  control: Control<any>; // Adjust 'any' to your form values type
  name: string;
  type?: string;
}

export const Input: React.FC<InputProps> = ({
  className,
  name,
  type = 'text',
  control,
  ...props
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (

    <>
      <div className="relative">
        <TextField
          type={type === 'password' && !showPassword ? 'password' : 'text'}
          className={cn(className, error ? 'input_error' : '')}
          {...props}
          {...field}
        />
      
        {type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            {showPassword ? (
              <EyeOff className="text-gray-500" size={20} />
            ) : (
              <Eye className="text-gray-500" size={20} />
            )}
          </button>
        )}
      </div>
      {error && <span className="error_message">{error.message}</span>}
    </>
  );
};
