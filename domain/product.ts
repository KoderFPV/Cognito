export interface IProductAttribute {
  name: string;
  value: string;
  unit?: string;
}

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
  attributes?: IProductAttribute[];
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
  attributes?: IProductAttribute[];
}
