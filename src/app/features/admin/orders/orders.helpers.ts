export const STATUS_LABEL: Record<string, string> = {
  PENDING:   'pendiente',
  PAID:      'pagado',
  SHIPPED:   'enviado',
  CANCELLED: 'cancelado',
  REFUNDED:  'reembolsado',
};

export const STATUS_BADGE: Record<string, string> = {
  PENDING:   'bg-warn-soft text-warn',
  PAID:      'bg-success-soft text-success',
  SHIPPED:   'bg-accent-soft text-accent',
  CANCELLED: 'bg-error-soft text-error',
  REFUNDED:  'bg-error-soft text-error',
};

export function ars(n: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);
}

export function fmtDate(iso: string): string {
  const d   = new Date(iso);
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const toDay = (date: Date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  const time         = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  const orderDay     = toDay(d);
  const todayStr     = toDay(now);
  const yest         = new Date(now);
  yest.setDate(now.getDate() - 1);
  const yesterdayStr = toDay(yest);

  if (orderDay === todayStr)     return `hoy ${time}`;
  if (orderDay === yesterdayStr) return `ayer ${time}`;
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

export function statusLabel(s: string): string {
  return STATUS_LABEL[s] ?? s.toLowerCase();
}

export function badgeClass(s: string): string {
  return 'px-2 py-0.5 rounded-full text-[10px] font-semibold ' + (STATUS_BADGE[s] ?? 'bg-surface-4 text-ink-2');
}
