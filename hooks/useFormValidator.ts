import { useForm, UseFormProps } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';

import { AnyObjectSchema } from 'yup';

export interface UseFormValidatorProps extends UseFormProps {
  validationSchema?: AnyObjectSchema;
}

export function useFormValidator({
  validationSchema,
  ...props
}: UseFormValidatorProps) {
  const resolver = validationSchema ? yupResolver(validationSchema) : undefined;

  return useForm({
    ...props,
    resolver,
    reValidateMode: props.reValidateMode || 'onChange',
  });
}
