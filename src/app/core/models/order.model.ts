export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED' | 'REFUNDED';

export interface AdminOrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface AdminOrder {
  id: number;
  userId: number | null;
  guestEmail: string | null;
  guestName: string | null;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  mpPreferenceId: string | null;
  notes: string | null;
  items: AdminOrderItem[];
  shippingStreet: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZipCode: string | null;
  shippingCountry: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderPayment {
  id: number;
  mpPaymentId: string;
  paymentMethod: string;
  payerEmail: string;
  amount: number;
  currencyId: string;
  status: string;
  paidAt: string;
}

export interface AdminOrderDetail {
  order: AdminOrder;
  payment: AdminOrderPayment | null;
}

export interface OrderCounts {
  pending: number;
  paid: number;
  shipped: number;
  cancelled: number;
  refunded: number;
  total: number;
}

export interface PagedOrders {
  content: AdminOrder[];
  totalElements: number;
  totalPages: number;
  number: number;
}
