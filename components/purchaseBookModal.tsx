import { useState, useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Modal, Box, Typography } from '@mui/material';
import { Button } from "@/components/ui/button";
import { Book, User } from '@/types';

interface PurchaseBookModalProps {
    selectedBook: Book | null;
     setSelectedBook: (book: Book | null) => void;
    isPurchasing: boolean;
    user: User;
    confirmPurchase: () => void;
}

const PurchaseBookModal = ({ selectedBook, setSelectedBook, isPurchasing, user, confirmPurchase }: PurchaseBookModalProps) => {
    

  return (
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
  );
};

export default PurchaseBookModal;