import React, { useEffect, useState } from 'react';
import { Book } from '@/types';
import { LoaderCircle, BookOpen, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useApi from '@/hooks/useApi';
import { buildUrlWithQuery } from '@/utils/utils';
import { BookApiRoutes } from '@/routes/BookApiRoutes';
import { useUser } from '@/hooks/useUser';
import ViewPdfModal from './viewPdfModal';

const Library = () => {
  const { user } = useUser();
  const { purchasedBooks = [] } = user || {};
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const { get, error } = useApi<Book[]>();

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength).trim()}...`;
  };

  useEffect(() => {
    const fetchUserBooks = async () => {
      if (!purchasedBooks?.length) {
        setBooks([]);
        return;
      }
  
      setIsLoadingBooks(true);
      try {
        const fetchedBooks = await Promise.all(
          purchasedBooks.map(async (bookId) => {
            const url = buildUrlWithQuery(BookApiRoutes.getBooks, { _id: bookId });
            const response = await get(url);
            return response?.data;
          })
        );
  
        const flattenedBooks = fetchedBooks.flat().filter((book) => book !== null) as Book[];
        setBooks(flattenedBooks);
      } catch (err) {
        setBooks([]);
      } finally {
        setIsLoadingBooks(false);
      }
    };
  
    fetchUserBooks();
  }, [purchasedBooks, get]);

  const handlePdfView = (pdfPath: string) => {
    setSelectedPdf(pdfPath);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex flex-col items-center justify-center space-y-6">
            <User className="w-16 h-16 text-purple-400 opacity-50" />
            <h1 className="text-3xl font-bold text-purple-300">My Library</h1>
            <p className="text-gray-400 text-lg">
              Please log in to view your library
            </p>
            <div className="h-1 w-24 bg-purple-500/20 rounded-full mt-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-purple-300">My Library</h1>
            <p className="text-gray-400 mt-2">
              {books.length} {books.length === 1 ? 'book' : 'books'} in your collection
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-purple-400" />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-400">Error loading books: {error.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingBooks ? (
            <div className="col-span-full flex flex-col items-center justify-center h-64 space-y-4">
              <LoaderCircle className="animate-spin text-purple-500 w-8 h-8" />
              <p className="text-gray-400">Loading your library...</p>
            </div>
          ) : books.length > 0 ? (
            books.map((book) => (
              <Card 
                key={book._id as string} 
                className="group bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-purple-300 group-hover:text-purple-200 transition-colors">
                    {truncateText(book.name, 50)}
                  </CardTitle>
                  <p className="text-gray-400 text-sm">by {truncateText(book.author, 40)}</p>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[4.5rem]">
                    <p className="text-gray-300">
                      {truncateText(book.description || '', 120)}
                    </p>
                  </div>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-500/10 text-purple-300">
                      {truncateText(book.subject, 30)}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => book.content && handlePdfView(book.content)}
                    className="w-full bg-purple-600 hover:bg-purple-500 transition-colors duration-300 flex items-center justify-center space-x-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Read Now</span>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center h-64 space-y-4">
              <BookOpen className="w-12 h-12 text-gray-500 opacity-50" />
              <p className="text-gray-400 text-lg">
                {purchasedBooks?.length ? 'Error loading books' : 'No purchased books found in your library'}
              </p>
            </div>
          )}
        </div>

        <ViewPdfModal 
          selectedPdf={selectedPdf} 
          setSelectedPdf={setSelectedPdf}
        />
      </div>
    </div>
  );
};

export default Library;