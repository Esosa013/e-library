import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { UserProvider } from "@/hooks/useUser";
import SessionProviderWrapper from './sessionProviderWrapper';
import Nav from '@/components/nav';
import Footer from '@/components/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'E-library',
  description: 'Digital library for university students',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://js.paystack.co/v1/inline.js"></script>
      </head>
      <body className={inter.className}>
        <SessionProviderWrapper>
          <UserProvider>
            <div className="min-h-screen bg-gray-950">
                <Nav />
              <main className="pt-16">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </UserProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}