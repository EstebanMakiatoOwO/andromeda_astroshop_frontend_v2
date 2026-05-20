import { Component, HostListener, computed, input, output, signal } from '@angular/core';
import { AdminCategory } from '../../../../core/models/category.model';

interface FlatNode {
  cat: AdminCategory;
  depth: number;
}

@Component({
  selector: 'app-category-tree',
  standalone: true,
  templateUrl: './category-tree.component.html',
})
export class CategoryTreeComponent {
  categories = input.required<AdminCategory[]>();
  selectedId = input<number | null>(null);

  categorySelect       = output<number>();
  reparent             = output<{ id: number; newParentId: number | null }>();
  deleteRequest        = output<number>();
  toggleShowInMenu     = output<number>();

  protected readonly search          = signal('');
  protected readonly expandedIds     = signal<Set<number>>(new Set());
  protected readonly hoverTargetId   = signal<number | null>(null);
  protected readonly isDroppingToRoot = signal(false);
  protected readonly openMenuId      = signal<number | null>(null);

  // Track the dragged id in dataTransfer — more reliable than a signal across drag lifecycle
  private draggedId: number | null = null;
  protected readonly isDragging = signal(false);

  protected readonly flatNodes = computed<FlatNode[]>(() =>
    this.flatten(this.categories(), 0, this.search().toLowerCase().trim()),
  );

  private readonly allParentIds = computed(() => this.collectParentIds(this.categories()));

  private flatten(cats: AdminCategory[], depth: number, q: string): FlatNode[] {
    const result: FlatNode[] = [];
    for (const cat of cats) {
      const matches    = !q || cat.name.toLowerCase().includes(q);
      const childNodes = cat.children.length
        ? this.flatten(cat.children, depth + 1, q)
        : [];
      if (matches || childNodes.length) {
        result.push({ cat, depth });
        if (this.expandedIds().has(cat.id) || q) {
          result.push(...childNodes);
        }
      }
    }
    return result;
  }

  private collectParentIds(cats: AdminCategory[]): number[] {
    const ids: number[] = [];
    for (const cat of cats) {
      if (cat.children.length) {
        ids.push(cat.id);
        ids.push(...this.collectParentIds(cat.children));
      }
    }
    return ids;
  }

  protected expandAll(): void { this.expandedIds.set(new Set(this.allParentIds())); }
  protected collapseAll(): void { this.expandedIds.set(new Set()); }

  protected toggle(id: number, event: Event): void {
    event.stopPropagation();
    const next = new Set(this.expandedIds());
    next.has(id) ? next.delete(id) : next.add(id);
    this.expandedIds.set(next);
  }

  protected isExpanded(id: number): boolean { return this.expandedIds().has(id); }
  protected hasChildren(cat: AdminCategory): boolean { return cat.children.length > 0; }
  protected select(id: number): void { this.categorySelect.emit(id); }

  // ── Drag & Drop ────────────────────────────────────────────────────

  protected onDragStart(id: number, event: DragEvent): void {
    this.draggedId = id;
    this.isDragging.set(true);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(id));
    }
  }

  protected onDragEnd(): void {
    this.draggedId = null;
    this.isDragging.set(false);
    this.hoverTargetId.set(null);
    this.isDroppingToRoot.set(false);
  }

  protected isDraggingThis(id: number): boolean {
    return this.draggedId === id;
  }

  protected onDragOver(id: number, event: DragEvent): void {
    event.preventDefault();
    if (id !== this.draggedId) {
      this.hoverTargetId.set(id);
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    }
  }

  protected onDragLeave(event: DragEvent): void {
    const target = event.currentTarget as HTMLElement;
    if (!target.contains(event.relatedTarget as Node)) {
      this.hoverTargetId.set(null);
    }
  }

  protected onDrop(targetId: number, event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const dragged = this.draggedId
      ?? (event.dataTransfer?.getData('text/plain') ? +event.dataTransfer.getData('text/plain') : null);
    if (dragged !== null && dragged !== targetId) {
      this.reparent.emit({ id: dragged, newParentId: targetId });
    }
    this.draggedId = null;
    this.isDragging.set(false);
    this.hoverTargetId.set(null);
  }

  // ── Root drop zone ─────────────────────────────────────────────────

  protected onRootDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDroppingToRoot.set(true);
    this.hoverTargetId.set(null);
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  }

  protected onRootDragLeave(): void {
    this.isDroppingToRoot.set(false);
  }

  protected onDropToRoot(event: DragEvent): void {
    event.preventDefault();
    const dragged = this.draggedId
      ?? (event.dataTransfer?.getData('text/plain') ? +event.dataTransfer.getData('text/plain') : null);
    if (dragged !== null) {
      this.reparent.emit({ id: dragged, newParentId: null });
    }
    this.draggedId = null;
    this.isDragging.set(false);
    this.isDroppingToRoot.set(false);
    this.hoverTargetId.set(null);
  }

  // ── Options menu ───────────────────────────────────────────────────

  protected toggleMenu(id: number, event: Event): void {
    event.stopPropagation();
    this.openMenuId.set(this.openMenuId() === id ? null : id);
  }

  protected onDeleteClick(id: number, event: Event): void {
    event.stopPropagation();
    this.openMenuId.set(null);
    this.deleteRequest.emit(id);
  }

  protected onToggleShowInMenu(id: number, event: Event): void {
    event.stopPropagation();
    this.openMenuId.set(null);
    this.toggleShowInMenu.emit(id);
  }

  @HostListener('document:click')
  protected closeMenu(): void {
    this.openMenuId.set(null);
  }
}
