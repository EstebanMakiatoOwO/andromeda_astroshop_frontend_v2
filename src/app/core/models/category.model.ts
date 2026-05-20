export interface AdminCategory {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  isActive: boolean;
  showInMenu: boolean;
  sortOrder: number;
  imageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  parentId: number | null;
  parentName: string | null;
  productCount: number;
  children: AdminCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRequest {
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
  showInMenu: boolean;
  sortOrder: number;
  imageUrl: string;
  metaTitle: string;
  metaDescription: string;
  parentId: number | null;
}
