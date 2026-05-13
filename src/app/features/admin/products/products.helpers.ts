export const STATUS_LABEL: Record<string, string> = {
  ACTIVE:       'activo',
  INACTIVE:     'inactivo',
  DRAFT:        'borrador',
  ON_REQUEST:   'a pedido',
  OUT_OF_STOCK: 'sin stock',
};

export const STATUS_BADGE: Record<string, string> = {
  ACTIVE:       'bg-success-soft text-success',
  INACTIVE:     'bg-error-soft text-error',
  DRAFT:        'bg-surface-4 text-ink-2',
  ON_REQUEST:   'bg-accent-soft text-accent',
  OUT_OF_STOCK: 'bg-warn-soft text-warn',
};

export function statusLabel(s: string): string {
  return STATUS_LABEL[s] ?? s.toLowerCase();
}

export function badgeClass(s: string): string {
  return 'px-2 py-0.5 rounded-full text-[10px] font-semibold ' + (STATUS_BADGE[s] ?? 'bg-surface-4 text-ink-2');
}

export function stockBadgeClass(stock: number, threshold: number): string {
  if (stock === 0)          return 'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-error-soft text-error';
  if (stock <= threshold)   return 'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-warn-soft text-warn';
  return 'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success-soft text-success';
}

export function stockLabel(stock: number, isCatalog: boolean): string {
  if (stock === 0)    return isCatalog ? 'a pedido' : 'sin stock';
  return `${stock} u.`;
}

export function ars(n: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);
}
