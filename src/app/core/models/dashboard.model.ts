// GET /api/v1/admin/dashboard/stats
export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  avgTicket: number;
  conversionRate: number;
}

// GET /api/v1/admin/dashboard/sales?period=30d
export interface SalesPoint {
  date: string;   // "2026-05-07"
  amount: number;
}

export type SalesPeriod = '1d' | '7d' | '30d' | '90d';

// GET /api/v1/admin/dashboard/top-categories
export interface TopCategory {
  name: string;
  amount: number;
  percent: number;
}

// GET /api/v1/admin/orders?size=5
export interface AdminOrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  isCatalog: boolean;
}

export interface AdminOrder {
  id: number;
  userId: number;
  guestEmail: string | null;
  guestName: string | null;
  status: string;  // PENDING | PREPARING | SHIPPED | DELIVERED | CANCELLED
  subtotal: number;
  shippingCost: number;
  total: number;
  mpPreferenceId: string | null;
  notes: string | null;
  items: AdminOrderItem[];
  createdAt: string;
  updatedAt: string;
}

// GET /api/v1/admin/products/low-stock
export interface LowStockProduct {
  id: number;
  name: string;
  sku: string;
  stock: number;
  stockAlertThreshold: number;
}
