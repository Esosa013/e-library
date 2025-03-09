'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Library, Book, LogOut, Coins, Search } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { AuthRoutes } from '@/routes/AuthRoutes';
import { BookRoutes } from '@/routes/BookRoutes';
import { useState } from 'react';
import BuyCoinsModal from './buyCoinsModal';
import { LucideIcon } from 'lucide-react';
import { Preview } from '@mui/icons-material';
import { signOut } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';

interface NavButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  primary?: boolean;
}

const Nav = () => {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [coin, setCoin] = useState(false);
  const pathName = usePathname();
  const [isLoading, setIsLoading] = useState(false);  
  const { successToast } = useToast();

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      // Clear local user data
      setUser(null);
      
      // End NextAuth session
      await signOut({ redirect: true, callbackUrl: AuthRoutes.signIn });
      
      successToast({ 
        title: 'Logged Out', 
        description: 'You have been successfully logged out' 
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const shouldShowNav = () => pathName !== AuthRoutes.signIn && pathName !== AuthRoutes.signUp;

  const NavButton = ({ icon: Icon, label, onClick, primary = false }: NavButtonProps) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
        primary
          ? 'text-purple-400 text-lg font-semibold hover:text-purple-300 hover:bg-purple-900/20'
          : 'text-gray-300 hover:text-purple-400 hover:bg-purple-900/20'
      }`}
    >
      <Icon className={primary ? 'h-6 w-6' : 'h-5 w-5'} />
      <span>{label}</span>
    </button>
  );

  return (
    <>
    {shouldShowNav() &&
    (<nav className="bg-gray-900 border-b border-gray-800 py-3 fixed w-full top-0 z-50 shadow-lg backdrop-blur-sm bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <NavButton
              icon={Book}
              label="Home"
              onClick={() => router.push(BookRoutes.home)}
              primary
            />
            <NavButton
              icon={Search}
              label="Search"
              onClick={() => router.push(BookRoutes.search)}
              primary
            />
            <NavButton
              icon={Library}
              label="My Library"
              onClick={() => router.push(BookRoutes.library)}
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2 bg-purple-900/30 rounded-lg px-4 py-2 border border-purple-800/50 shadow-inner">
              <Coins className="h-5 w-5 text-purple-400" />
              <span className="text-purple-200 font-medium">{user?.coins ?? 0} Coins</span>
            </div>
            
            <Button
              onClick={() => setCoin(true)}
              className="bg-purple-600 hover:bg-purple-700 transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Buy Coins
            </Button>

            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-gray-400 hover:text-gray-200 transition-all duration-200 hover:bg-gray-800/50"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      <BuyCoinsModal 
        coin={coin}
        setcoin={setCoin}
        userCoins={user?.coins as number}
      />
    </nav>
    )}
  </>
  );
};

export default Nav;