import { ObjectId } from "mongodb";

export interface Book {
    _id?: string | ObjectId;
    name: string;
    description: string;
    coverPage: string;
    content: string;
    author: string;
    year: number;
    subject: string;
    price: number;
    sales: number;
  }