import useApi from "@/hooks/useApi";
import { useUser } from "@/hooks/useUser";
import { BookApiRoutes } from "@/routes/BookApiRoutes";
import { Book } from "@/types";
import { buildUrlWithQuery } from "@/utils/utils";
import { useState, useEffect } from "react";


const useLibrary = () => {
  const { user } = useUser();
    const { purchasedBooks = [] } = user || {};
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoadingBooks, setIsLoadingBooks] = useState(false);
    const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
    const { get, error } = useApi<Book[]>();
  
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
  return { books, isLoadingBooks, error, handlePdfView, selectedPdf, setSelectedPdf };
}

export default useLibrary