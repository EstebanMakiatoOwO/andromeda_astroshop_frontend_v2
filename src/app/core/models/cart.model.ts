export interface CartItem {
  id: number;
  productId: number;
  name: string;
  meta: string;
  qty: number;
  unitPriceMxn: number;
  unitPriceUsd: number;
  stock: number;
  image: string | null;
}
