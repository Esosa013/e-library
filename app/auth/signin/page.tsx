'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useFormValidator } from '@/hooks/useFormValidator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoaderCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import GoogleIcon from '@images/svg/google.svg';
import { signInValidationSchema, signInDefaultValues } from '../signup/constant';
import useApi from '@/hooks/useApi';
import { User } from '@/types';
import { buildUrlWithQuery } from '@/utils/utils';
import { UserApiRoutes } from '@/routes/UserApiRoutes';
import { BookRoutes } from '@/routes/BookRoutes';
import Link from 'next/link';
import { AuthRoutes } from '@/routes/AuthRoutes';

export default function SignIn() {
  const { setUser, user } = useUser();
  const { data: session, status } = useSession();
  const { successToast, errorToast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { get, data, error, isLoading: isApiLoading } = useApi<User[]>();
  const { control, handleSubmit, formState, setError } = useFormValidator({
    validationSchema: signInValidationSchema,
    defaultValues: signInDefaultValues,
  });

  // Effect to check authentication status and redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchUserData(session.user.id);
    } else if (status === 'unauthenticated' && !isInitialLoad) {
      // Only clear user data if we're definitely not authenticated (after initial load)
      setUser(null);
    }

    if (status !== 'loading') {
      setIsInitialLoad(false);
    }
  }, [status, session]);

  // Function to fetch user data - reusable for different contexts
  const fetchUserData = async (userId: string) => {
    try {
      await get(buildUrlWithQuery(UserApiRoutes.getUsers, { _id: userId }));
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  // Effect to set user data when API response changes
  useEffect(() => {
    if (data && data.length > 0 && !error) {
      const userData = data[0];
      setUser({
        _id: userData._id || '',
        password: userData.password || '',
        email: userData.email || '',
        name: userData.name || '',
        coins: userData.coins || 0,
        purchasedBooks: userData.purchasedBooks || [],
      });

      // Only show toast and navigate if we're coming from a sign-in action, not a refresh
      if (isLoading) {
        successToast({ title: 'Sign In Successful', description: 'You have been logged in!' });
        router.push(BookRoutes.search);
        setIsLoading(false);
      }
    } else if (error) {
      errorToast({ title: 'Error fetching user data', description: error.message });
      setIsLoading(false);
    }
  }, [data, error]);

  const handleSignInResponse = async (res: any, signInMethod: 'credentials' | 'google') => {
    if (res?.error) {
      errorToast({
        title: signInMethod === 'credentials' ? 'Sign In Failed' : 'Google Sign-In Failed',
        description: res.error || 'Authentication failed',
      });

      setError('root', {
        type: 'manual',
        message: res.error || 'Authentication failed',
      });

      setIsLoading(false);
      return false;
    }
    
    // The session will be updated automatically by next-auth
    // We'll fetch the user data in the useEffect that watches for session changes
    return true;
  };

  const onSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    const res = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
    });
    await handleSignInResponse(res, 'credentials');
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const res = await signIn('google', { redirect: false });
    await handleSignInResponse(res, 'google');
  };

  // If already logged in and user data is loaded, redirect to books page
  useEffect(() => {
    if (status === 'authenticated' && user?._id && !isInitialLoad) {
      router.push(BookRoutes.search);
    }
  }, [status, user, isInitialLoad, router]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-gray-900 shadow-lg rounded-lg border border-gray-800">
        <h1 className="text-2xl font-bold text-center text-purple-400 mb-6">Sign In</h1>

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

          {formState.errors.root && (
            <p className="text-red-500 text-sm text-center">
              {formState.errors.root.message}
            </p>
          )}

          <Button
            type="submit"
            disabled={isLoading || isApiLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {(isLoading || isApiLoading) ? <LoaderCircle className="animate-spin" /> : 'Sign In'}
          </Button>
        </form>

        <div className="flex items-center justify-center my-4">
          <div className="border-t border-gray-700 flex-grow"></div>
          <span className="px-4 text-gray-500">OR</span>
          <div className="border-t border-gray-700 flex-grow"></div>
        </div>

        <Button
          onClick={handleGoogleSignIn}
          disabled={isLoading || isApiLoading}
          className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700"
        >
          <GoogleIcon className="w-5 h-5" />
          Sign in with Google
        </Button>

        <div className="mt-4 text-center">
          <span className="text-gray-400">Don't have an account?</span>
          <Link href={AuthRoutes.signUp} className="text-purple-400 hover:underline ml-2">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}