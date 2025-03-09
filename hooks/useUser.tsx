'use client';

import { User } from "@/types";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'epiphany_user_data';

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load user data from localStorage on initial component mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUserState(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user data from localStorage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Custom setter to update state and persist to localStorage
  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    
    try {
      if (newUser) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error saving user data to localStorage:', error);
    }
  };

  if (!isInitialized) {
    // Optional: Return a loading state or null while initializing
    return null;
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};