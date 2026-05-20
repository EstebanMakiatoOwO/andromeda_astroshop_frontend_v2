export interface PublicProductCategory {
  id: number;
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  imageUrl: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicProductBrand {
  id: number;
  name: string;
  description: string;
  logoUrl: string;
}

export interface PublicProduct {
  id: number;
  sku: string | null;
  barcode: string | null;
  name: string;
  shortDescription: string;
  longDescription: string;
  stock: number;
  stockAlertThreshold: number | null;
  costPrice: number | null;
  price: number;
  isActive: boolean;
  isCatalog: boolean;
  images: string[];
  categories: PublicProductCategory[];
  brand: PublicProductBrand | null;
  createdAt: string;
  updatedAt: string;
}
