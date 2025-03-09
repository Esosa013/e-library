import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Book, User } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Search as SearchIcon, Filter, X, RefreshCw } from 'lucide-react';
import useApi from '@/hooks/useApi';
import { buildUrlWithQuery, truncateText } from '@/utils/utils';
import { BookApiRoutes } from '@/routes/BookApiRoutes';
import { FilterState, useFilter } from '@/hooks/useFilter';
import { BookRoutes } from '@/routes/BookRoutes';
import { errorToast, successToast } from './ui/use-toast';
import { useFormValidator } from '@/hooks/useFormValidator';
import { Input } from './ui/input';
import { useUser } from '@/hooks/useUser';
import { Modal, Box, Typography } from '@mui/material';
import ViewPdfModal from './viewPdfModal';
import useDebounceThrottle from '@/hooks/useDebounceThrottle';
import { UserApiRoutes } from '@/routes/UserApiRoutes';

const Search = () => {
  const router = useRouter();
  const { filters, resetFilters, applyFilters } = useFilter();
  const { get, post, isLoading, error, data } = useApi<Book[]>();
  const { control, handleSubmit, formState } = useFormValidator({});
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { user, setUser } = useUser();
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearchTerm = useDebounceThrottle(searchTerm, {
    delay: 500,
    limit: 1000,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearAll = () => {
    resetFilters(BookRoutes.search);
    setSearchTerm('');
    setIsFilterOpen(false);
    fetchBooks();
  };

  const handleRetry = () => {
    fetchBooks();
  };

  interface Item {
    name: string;
    price: number;
    quantity: number;
  }
  
  

  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      FilterBook({ name: debouncedSearchTerm });
    }
  }, [debouncedSearchTerm]);

  const FilterBook = async (newFilters: FilterState) => {
    try {
      applyFilters(BookRoutes.search, newFilters);
      successToast({ title: 'Success!', description: 'Books filtered.' });
    } catch (e: unknown) {
      console.error('Error while applying filters:', e);
      errorToast({
        title: 'Error!',
        description: e instanceof Error ? e.message : 'An unknown error occurred.',
      });
    }
  };

  const handlePdfView = (pdfPath: string) => {
    setSelectedPdf(pdfPath);
  };


  const handlePurchase = async (book: Book) => {
    setSelectedBook(book);
  };

  const confirmPurchase = async () => {
    if (!selectedBook) return;

    setIsPurchasing(true);
    try {
      const res = await post(BookApiRoutes.purchaseBook, {
        bookId: selectedBook._id,
        price: selectedBook.price,
        userId: user?._id,
      });

      if (res.data) {
        successToast({
          title: 'Purchase Successful!',
          description: `You now own "${selectedBook.name}". Remaining coins: ${user?.coins}`,
        });
        const userRes = await fetch(buildUrlWithQuery(UserApiRoutes.getUsers, { _id: user?._id }));
        
        const userData: User[] = await userRes.json();
        const firstUser = userData[0];
        
        setUser({
          ...user,
          purchasedBooks: firstUser.purchasedBooks,
          coins: firstUser.coins,
        } as User);
        fetchBooks();
      }
    } catch (e) {
      errorToast({
        title: 'Purchase Failed',
        description: e instanceof Error ? e.message : 'Failed to complete purchase',
      });
    } finally {
      setIsPurchasing(false);
      setSelectedBook(null);
    }
  };

  const fetchBooks = React.useCallback(async () => {
    await get(buildUrlWithQuery(BookApiRoutes.getBooks, filters));
  }, [filters, get]);

  React.useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

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
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-300">Year</h3>
                <div className="flex flex-wrap gap-2">
                  {[2005, 2006, 2020, 2021].map((year) => (
                    <Button
                      key={year}
                      variant="outline"
                      size="sm"
                      onClick={() => FilterBook({year})}
                      className="text-sm border-gray-700 text-gray-200 hover:text-white hover:bg-gray-800"
                    >
                      {year}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-300">Subject</h3>
                <div className="flex flex-wrap gap-2">
                  {['Computer Science','Programming','Design','Marketing','History'].map((subject) => (
                    <Button
                      key={subject}
                      variant="outline"
                      size="sm"
                      onClick={() => FilterBook({subject})}
                      className="text-sm border-gray-700 text-gray-200 hover:text-white hover:bg-gray-800"
                    >
                      {subject}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-300">Price</h3>
                <div className="flex flex-wrap gap-2">
                  {[10,15,20,25,30].map((price) => (
                    <Button
                      key={price}
                      variant="outline"
                      size="sm"
                      onClick={() => FilterBook({price})}
                      className="text-sm border-gray-700 text-gray-200 hover:text-white hover:bg-gray-800"
                    >
                      {price}
                    </Button>
                  ))}
                </div>
              </div>
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

      <Modal
        open={!!selectedBook}
        onClose={() => !isPurchasing && setSelectedBook(null)}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: '#1f2937',
            color: '#f3f4f6',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          {isPurchasing ? (
            <div className="flex flex-col items-center justify-center py-4">
              <LoaderCircle className="h-8 w-8 animate-spin text-purple-500" />
              <p className="mt-2 text-gray-600">Processing purchase...</p>
            </div>
          ) : (
            <>
              <Typography id="modal-title" variant="h6" component="h2">
                Confirm Purchase
              </Typography>
              <Typography id="modal-description" sx={{ mt: 2 }}>
                {selectedBook && (
                  <>
                    Are you sure you want to purchase "{selectedBook.name}" for {selectedBook.price} coins?
                    {user?.coins !== undefined && (
                      <p className="mt-2 text-sm text-gray-600">
                        Your balance: {user.coins} coins
                      </p>
                    )}
                  </>
                )}
              </Typography>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outline"
                  onClick={() => setSelectedBook(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={confirmPurchase}
                >
                  Confirm Purchase
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      <ViewPdfModal 
        selectedPdf={selectedPdf} 
        setSelectedPdf={setSelectedPdf}
      />
    </div>
  );
};

export default Search;