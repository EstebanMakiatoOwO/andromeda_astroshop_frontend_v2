export interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badgeType?: 'warn' | 'error';
  badgeCount?: number;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

export interface Breadcrumb {
  label: string;
  route?: string;
}
