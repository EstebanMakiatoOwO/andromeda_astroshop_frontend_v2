import { PublicProduct } from './public-product.model';

export interface CatalogFilters {
  q:           string;
  categoryIds: number[];
  brandIds:    number[];
  inStock:     boolean;
  onOrder:     boolean;
  minPrice:    number | null;
  maxPrice:    number | null;
  sortBy:      'relevance' | 'price_asc' | 'price_desc' | 'rating';
  page:        number;
}

export const DEFAULT_FILTERS: CatalogFilters = {
  q:           '',
  categoryIds: [],
  brandIds:    [],
  inStock:     false,
  onOrder:     false,
  minPrice:    null,
  maxPrice:    null,
  sortBy:      'relevance',
  page:        1,
};

export interface CatalogFacetItem {
  id:    number;
  name:  string;
  count: number;
}

export interface CatalogFacets {
  inStockCount: number;
  onOrderCount: number;
  brands:       CatalogFacetItem[];
  categories:   CatalogFacetItem[];
}

export interface CatalogPage {
  products:   PublicProduct[];
  total:      number;
  page:       number;
  pageSize:   number;
  totalPages: number;
  facets:     CatalogFacets;
}
