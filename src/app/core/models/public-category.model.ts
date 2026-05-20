export interface PublicCategory {
  id: number;
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
  showInMenu: boolean;
  sortOrder: number;
  imageUrl: string;
  parentId: number | null;
  children: PublicCategory[];
  createdAt: string;
  updatedAt: string;
}
