'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useFormValidator } from '@/hooks/useFormValidator';
import useApi from '@hooks/useApi';
import { signUpValidationSchema, signUpDefaultValues } from './constant';
import { signIn } from 'next-auth/react';
import GoogleIcon from '@images/svg/google.svg';
import Link from 'next/link';
import { AuthRoutes } from '@/routes/AuthRoutes';

export default function SignUp() {
  const { successToast, errorToast } = useToast();
  const router = useRouter();
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState } = useFormValidator({
    validationSchema: signUpValidationSchema,
    defaultValues: signUpDefaultValues,
  });

  const onSubmit = async (data: { email: string; password: string; confirmPassword: string }) => {
    setIsLoading(true);
    try {
      const result = await api.post('/api/auth/signup', { ...data, purchasedBooks: [], coins: 100 });
      if (result.data) {
        successToast({
          title: 'Success!',
          description: 'Account created successfully. Please sign in.',
        });
        router.push(AuthRoutes.signIn);
      }
    } catch (e: unknown) {
      errorToast({
        title: 'Error!',
        description: e instanceof Error ? e.message : 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const res = await signIn('google', { redirect: false, callbackUrl: AuthRoutes.signIn });
    if (res?.error) {
      errorToast({ title: 'Google Sign-Up Failed', description: res.error });
    } else {
      successToast({ title: 'Sign-Up Successful', description: 'Redirecting to sign in...' });
      router.push(AuthRoutes.signIn);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-gray-900 shadow-lg rounded-lg border border-gray-800">
        <h1 className="text-2xl font-bold text-center text-purple-400 mb-6">Sign Up</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            name="email"
            control={control}
            placeholder="Email"
            type="email"
            className="w-full bg-gray-800 text-gray-100 border border-gray-700 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
          />
          <Input
            name="password"
            control={control}
            placeholder="Password"
            type="password"
            className="w-full bg-gray-800 text-gray-100 border border-gray-700 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
          />
          <Input
            name="confirmPassword"
            control={control}
            placeholder="Confirm Password"
            type="password"
            className="w-full bg-gray-800 text-gray-100 border border-gray-700 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
          />

          {formState.errors.root && (
            <p className="text-red-500 text-sm text-center">
              {formState.errors.root.message}
            </p>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isLoading ? <LoaderCircle className="animate-spin" /> : 'Sign Up'}
          </Button>
        </form>

        <div className="flex items-center justify-center my-4">
          <div className="border-t border-gray-700 flex-grow"></div>
          <span className="px-4 text-gray-500">OR</span>
          <div className="border-t border-gray-700 flex-grow"></div>
        </div>

        <Button
          onClick={handleGoogleSignUp}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700"
        >
          <GoogleIcon className="w-5 h-5" />
          Sign up with Google
        </Button>

        <div className="mt-4 text-center">
          <span className="text-gray-400">Already have an account?</span>
          <Link href={AuthRoutes.signIn} className="text-purple-400 hover:underline ml-2">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
