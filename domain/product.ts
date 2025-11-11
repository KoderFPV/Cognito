import { ObjectId } from 'mongodb';

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  stock: number;
  imageUrl?: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
}

export interface IProductMongo extends Omit<IProduct, '_id'> {
  _id: ObjectId;
}

export interface IProductCreateInput {
  name: string;
  description: string;
  price: number;
  sku: string;
  stock: number;
  imageUrl?: string;
  category: string;
  isActive: boolean;
}
