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

export interface PublicProductSpec {
  key: string;
  value: string;
}

export interface PublicProduct {
  id: number;
  sku: string | null;
  slug: string | null;
  barcode: string | null;
  name: string;
  shortDescription: string;
  longDescription: string;
  stock: number;
  stockAlertThreshold: number | null;
  costPrice: number | null;
  price: number;
  priceMxn: number;
  priceUsd: number;
  isActive: boolean;
  isCatalog: boolean;
  images: string[];
  categories: PublicProductCategory[];
  brand: PublicProductBrand | null;
  rating: number | null;
  reviewCount: number;
  specifications: PublicProductSpec[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  youMayLike: RelatedProductSummary[];
  relatedProducts: RelatedProductSummary[];
  loyaltyPoints: number;
  minSaleQty: number;
  maxSaleQty: number | null;
  qtyIncrements: number;
  isInStock: boolean;
  isLowStock: boolean;
  isNew: boolean;
  isOnSale: boolean;
  salePrice: number | null;
}

export interface RelatedProductSummary {
  id: number;
  name: string;
  slug: string | null;
  price: number;
  priceMxn: number;
  priceUsd: number;
  image: string | null;
}
