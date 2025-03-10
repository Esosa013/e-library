import useApi from '@/hooks/useApi';
import useDebounceThrottle from '@/hooks/useDebounceThrottle';
import { useFilter, FilterState } from '@/hooks/useFilter';
import { useFormValidator } from '@/hooks/useFormValidator';
import { useUser } from '@/hooks/useUser';
import { BookApiRoutes } from '@/routes/BookApiRoutes';
import { BookRoutes } from '@/routes/BookRoutes';
import { UserApiRoutes } from '@/routes/UserApiRoutes';
import { Book, User } from '@/types';
import { buildUrlWithQuery } from '@/utils/utils';
import React, { useEffect, useState } from 'react';
import { successToast, errorToast } from '../ui/use-toast';

export const useSearch = () => {
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

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const filterList = [
    { title: "Year", options: [2005, 2006, 2020, 2021] },
    { title: "Subject", options: ["Computer Science", "Programming", "Design", "Marketing", "History"] },
    { title: "Price", options: [10, 15, 20, 25, 30] }
  ];

    return {
        filters,
        control,
        handleSubmit,
        formState,
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
        setIsFilterOpen,
        searchTerm,
        setSearchTerm,
        FilterBook,
        setSelectedBook,
        setSelectedPdf,
        filterList,
    };
};

