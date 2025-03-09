'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { BookRoutes } from "@/routes/BookRoutes";
import { useUser } from "@/hooks/useUser";
import { User } from "@/types";
import { successToast, errorToast } from "@/components/ui/use-toast";

export default function PaymentSuccess() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, setUser } = useUser();

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        // Get the purchase details from localStorage
        const purchaseData = localStorage.getItem('pendingCoinPurchase');
        
        if (!purchaseData) {
          errorToast({
            title: "Transaction Error",
            description: "No pending transaction found",
          });
          router.push(BookRoutes.search);
          return;
        }
        
        const { userId, coins } = JSON.parse(purchaseData);
        
        // Verify the transaction was successful (you could verify with Paystack here if needed)
        const response = await axios.post("/api/coin", {
          userId: userId,
          coins: coins,
        });
        
        if (response.data.success) {
          setUser({ ...user, coins: response.data.updatedCoins } as User);
          
          successToast({
            title: "Coin Purchase Successful",
            description: `Added ${coins} coins to your account!`,
          });
          
          // Clear the pending purchase data
          localStorage.removeItem('pendingCoinPurchase');
        } else {
          throw new Error("Failed to add coins to account");
        }
      } catch (error) {
        console.error("Error processing payment success:", error);
        errorToast({
          title: "Transaction Error",
          description: "Failed to complete your purchase",
        });
      } finally {
        setLoading(false);
        router.push(BookRoutes.search);
      }
    };

    handlePaymentSuccess();
  }, [router, setUser, user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Processing Your Payment</h1>
        
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 border-4 border-t-purple-600 border-b-purple-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Please wait while we confirm your purchase...</p>
          </div>
        ) : (
          <p className="text-center text-green-600">Redirecting you back to the app...</p>
        )}
      </div>
    </div>
  );
}