import { useState } from "react";
import axios from "axios";
import { Modal, Box, TextField, CircularProgress } from "@mui/material";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { User } from "@/types";
import { errorToast } from "./ui/use-toast";
import { useRouter } from "next/navigation";

interface BuyCoinsModalProps {
  coin: boolean;
  setcoin: (coin: boolean) => void;
  userCoins: number;
}

const BuyCoinsModal = ({ coin, setcoin, userCoins }: BuyCoinsModalProps) => {
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const conversionRate = 200 / 10;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(e.target.value));
  };

  const handleBuyCoins = async () => {
    setLoading(true);
    try {
      localStorage.setItem('pendingCoinPurchase', JSON.stringify({
        userId: user?._id,
        coins: amount * conversionRate,
        amount
      }));

      const response = await axios.post("/api/payment", {
        email: user?.email,
        items: [{ name: "Coins", price: amount }],
      });

      if (response.data.success && response.data.authorizationUrl) {
        window.location.href = response.data.authorizationUrl;
      } else {
        errorToast({
          title: "Payment Initialization Failed",
          description: "Failed to start payment process",
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      errorToast({
        title: "Payment Error",
        description: "An error occurred while processing your payment",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={!!coin} onClose={() => setcoin(false)} aria-labelledby="buy-coins">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          height: "90%",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <div className="h-full w-full flex flex-col">
          <div className="flex justify-between items-center mb-4 bg-gray-800 p-2 rounded">
            <span className="text-white font-semibold">Buy Coins</span>
            <Button onClick={() => setcoin(false)} className="bg-gray-700 hover:bg-gray-600">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-4">
            <TextField
              label="Enter Amount in Naira"
              type="number"
              value={amount}
              onChange={handleAmountChange}
              fullWidth
              variant="outlined"
              className="mb-2"
            />
            <div className="text-sm text-gray-400">Conversion Rate: 10 Naira = 200 Coins</div>
            <div className="text-sm text-gray-500 mt-2">You will receive {amount * conversionRate} coins</div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center">
              <CircularProgress />
            </div>
          ) : (
            <Button
              onClick={handleBuyCoins}
              className="bg-purple-600 hover:bg-purple-700 transition-colors duration-200 shadow-md hover:shadow-lg"
              disabled={amount <= 0}
            >
              Confirm Payment
            </Button>
          )}
        </div>
      </Box>
    </Modal>
  );
};

export default BuyCoinsModal;