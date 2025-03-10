import React from 'react';
import { LoaderCircle, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { truncateText } from '@/utils/utils';
import ViewPdfModal from '../viewPdfModal';
import useLibrary from './useLibrary';

const Library = () => {
  const {books, isLoadingBooks, error, handlePdfView, selectedPdf, setSelectedPdf} = useLibrary();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-purple-300">My Library</h1>
          <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-purple-400" />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-400">Error loading books: {error.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoadingBooks ? (
            <div className="col-span-full flex flex-col items-center justify-center h-64 space-y-4">
              <LoaderCircle className="animate-spin text-purple-500 w-8 h-8" />
              <p className="text-gray-400">Loading your library...</p>
            </div>
          ) : books.length > 0 ? (
            books.map((book) => (
              <Card 
                key={book._id as string} 
                className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 overflow-hidden rounded-xl"
              >
                <img 
                  src={book.coverPage} 
                  alt={`${book.name} cover`} 
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <CardHeader className="p-4">
                  <CardTitle className="text-lg font-semibold text-purple-300 group-hover:text-purple-200 transition-colors">
                    {truncateText(book.name, 50)}
                  </CardTitle>
                  <p className="text-gray-400 text-sm">by {truncateText(book.author, 40)}</p>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-gray-300 text-sm h-16 overflow-hidden">
                    {truncateText(book.description || '', 120)}
                  </p>
                </CardContent>
                <CardFooter className="p-4 flex justify-between items-center">
                  <span className="text-sm px-3 py-1 rounded-full bg-purple-500/10 text-purple-300">
                    {truncateText(book.subject, 30)}
                  </span>
                  <Button 
                    onClick={() => book.content && handlePdfView(book.content)}
                    className="bg-purple-600 hover:bg-purple-500 transition-colors duration-300 flex items-center space-x-2 px-4 py-2 text-sm rounded-lg"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Read</span>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center h-64 space-y-4">
              <BookOpen className="w-12 h-12 text-gray-500 opacity-50" />
              <p className="text-gray-400 text-lg">No purchased books found in your library</p>
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
