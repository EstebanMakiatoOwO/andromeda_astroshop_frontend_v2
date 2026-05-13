export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ON_REQUEST' | 'OUT_OF_STOCK';

export interface ProductCategory {
  id: number;
  name: string;
  description: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductBrand {
  id: number;
  name: string;
  description: string;
  logoUrl: string;
}

export interface AdminProduct {
  id: number;
  sku: string;
  barcode: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  stock: number;
  stockAlertThreshold: number;
  costPrice: number;
  price: number;
  isActive: boolean;
  isCatalog: boolean;
  status: ProductStatus;
  images: string[];
  categories: ProductCategory[];
  brand: ProductBrand | null;
  createdAt: string;
  updatedAt: string;
}

export interface PagedProducts {
  content: AdminProduct[];
  totalElements: number;
  totalPages: number;
  number: number;
}
