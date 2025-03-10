import React from 'react';
import { User } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Search as SearchIcon, Filter, X, RefreshCw } from 'lucide-react';
import { truncateText } from '@/utils/utils';
import ViewPdfModal from '../viewPdfModal';
import { useSearch } from './useSearch';
import PurchaseBookModal from '../purchaseBookModal';
import FilterSection from './filterSection';

const Search = () => {
  const { 
    filters,
    isLoading,
    error,
    data,
    selectedBook,
    isPurchasing,
    isFilterOpen,
    user,
    selectedPdf,
    handleSearchChange,
    handleClearAll,
    handleRetry,
    handlePdfView,
    handlePurchase,
    confirmPurchase,
    searchTerm,
    setSearchTerm,
    FilterBook,
    setSelectedBook,
    setSelectedPdf,
    filterList,
    setIsFilterOpen,
  } = useSearch();

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="bg-gray-900 mt-16 shadow-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-100">Book Library</h1>
            <div className="flex items-center gap-4 flex-1 md:max-w-xl">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search books..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-700 rounded-md bg-gray-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                variant="outline"
                className="flex items-center gap-2 border-gray-700 text-gray-200 bg-gray-800"
              >
                <Filter className="h-4 w-4" />
                Filters {Object.keys(filters).length > 0 && `(${Object.keys(filters).length})`}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isFilterOpen && (
        <div className="bg-gray-900 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-100">Filter Books</h2>
                {Object.keys(filters).length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-gray-300 hover:text-gray-100"
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsFilterOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filterList.map((filter) => (
        <FilterSection 
          key={filter.title}
          title={filter.title} 
          options={filter.options} 
          filterHandler={FilterBook}
        />
      ))}
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center justify-center space-y-4">
            <LoaderCircle className="h-8 w-8 animate-spin text-purple-400" />
            <p className="text-gray-300">Loading books...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-red-400 text-center">
              <p className="text-lg font-semibold">Unable to load books</p>
              <p className="text-sm">{error.message}</p>
            </div>
            <Button onClick={handleRetry} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      )}


      {!isLoading && !error && data && data.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.map((book) => (
              <Card
                key={book._id as string}
                className="bg-gray-900 border-gray-800 hover:border-purple-500 transition-all duration-300 hover:shadow-lg"
              >
                <CardHeader className="space-y-2">
                  <div className="aspect-[3/4] overflow-hidden rounded-lg">
                    <img
                      src={book.coverPage}
                      alt={book.name}
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardTitle className="text-lg font-semibold text-purple-300">
                    {book.name}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    by {book.author} • {book.year}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 line-clamp-3">
                    {truncateText(book.description,40)}
                  </p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900 text-purple-300">
                      {book.subject}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center pt-4 border-t border-gray-800">
                  <span className="text-lg font-medium text-purple-300">
                    {book.price} coins
                  </span>
                  {user?.purchasedBooks.includes(book._id as string) ? (
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => book.content && handlePdfView(book.content)}
                    >
                      View Book
                    </Button>
                  ) : (
                    <Button
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => handlePurchase(book)}
                    >
                      Purchase
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

     <PurchaseBookModal 
        selectedBook={selectedBook} 
        setSelectedBook={setSelectedBook} 
        isPurchasing={isPurchasing} 
        user={user as User} 
        confirmPurchase={confirmPurchase}
      />

      <ViewPdfModal 
        selectedPdf={selectedPdf} 
        setSelectedPdf={setSelectedPdf}
      />
    </div>
  );
};

export default Search;