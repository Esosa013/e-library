'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BookOpen, Search, Library, Star, BookMarked, GraduationCap } from 'lucide-react';
import { BookRoutes } from '@/routes/BookRoutes';
import { useUser } from '@/hooks/useUser';

const Home = () => {
  const router = useRouter();
  const { user } = useUser();

  const features = [
    {
      icon: <BookOpen className="h-6 w-6 text-purple-400" />,
      title: "Extensive Collection",
      description: "Access thousands of academic books covering various subjects and disciplines."
    },
    {
      icon: <Star className="h-6 w-6 text-purple-400" />,
      title: "Quality Content",
      description: "Carefully curated content from renowned authors and publishers."
    },
    {
      icon: <BookMarked className="h-6 w-6 text-purple-400" />,
      title: "Easy Access",
      description: "Read your books anytime, anywhere, on any device."
    },
    {
      icon: <GraduationCap className="h-6 w-6 text-purple-400" />,
      title: "Academic Focus",
      description: "Tailored for university students with curriculum-aligned content."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-gray-900"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
              Your Digital Academic Library
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Access thousands of academic books, textbooks, and research materials all in one place.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => router.push(BookRoutes.search)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg"
              >
                <Search className="mr-2 h-5 w-5" />
                Browse Books
              </Button>
              {user && (
                <Button
                  onClick={() => router.push(BookRoutes.library)}
                  variant="outline"
                  className="border-purple-500 text-purple-400 hover:bg-purple-900/20 px-8 py-6 text-lg"
                >
                  <Library className="mr-2 h-5 w-5" />
                  My Library
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Choose Our E-Library?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-purple-500 transition-all duration-300"
              >
                <div className="bg-purple-900/20 rounded-lg p-3 w-fit mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 p-8 rounded-lg border border-gray-800 text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">10,000+</div>
              <div className="text-gray-300">Academic Books</div>
            </div>
            <div className="bg-gray-900 p-8 rounded-lg border border-gray-800 text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">50+</div>
              <div className="text-gray-300">Subject Areas</div>
            </div>
            <div className="bg-gray-900 p-8 rounded-lg border border-gray-800 text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-gray-300">Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Start Reading?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already using our digital library for their academic success.
          </p>
          <Button
            onClick={() => router.push(BookRoutes.search)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg"
          >
            Explore Library
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;