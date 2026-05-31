export interface CartItem {
  id: number;
  productId: number;
  name: string;
  sku: string | null;
  image: string | null;
  qty: number;
  stock: number;
  unitPriceMxn: number;
  unitPriceUsd: number;
  rowTotalMxn: number;
  rowTotalUsd: number;
}

export interface Cart {
  items: CartItem[];
  subtotalMxn: number;
  subtotalUsd: number;
  itemCount: number;
  cartToken?: string | null;
}
