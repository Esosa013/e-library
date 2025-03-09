export interface User {
    _id?: string;
    password: string;
    email: string;
    name: string;
    coins: number;
    purchasedBooks: string[];
  }