import {
  AfterViewInit, Component, OnDestroy, TemplateRef, ViewChild,
  computed, inject, signal,
} from '@angular/core';
import { AdminCategory, CategoryRequest } from '../../../core/models/category.model';
import { CategoriesService } from '../../../core/services/categories.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { AdminPageActionsService } from '../../../core/services/admin-page-actions.service';
import { CategoryTreeComponent } from './components/category-tree.component';
import { CategoryEditPanelComponent } from './components/category-edit-panel.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';

type PanelMode = 'none' | 'new' | 'edit';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CategoryTreeComponent, CategoryEditPanelComponent, ConfirmDialogComponent],
  templateUrl: './categories.component.html',
})
export class CategoriesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('pageActions') private pageActionsTemplate!: TemplateRef<unknown>;

  private readonly svc     = inject(CategoriesService);
  private readonly bc      = inject(BreadcrumbService);
  private readonly pageSvc = inject(AdminPageActionsService);

  protected readonly treeCategories = signal<AdminCategory[]>([]);
  protected readonly isTreeLoading  = signal(true);
  protected readonly panelMode      = signal<PanelMode>('none');
  protected readonly selectedId     = signal<number | null>(null);

  // Tree-initiated delete
  protected readonly showConfirmDelete = signal(false);
  protected readonly deleteTargetId   = signal<number | null>(null);
  protected readonly deleteTargetName = signal('');

  protected readonly flatCategories = computed(() => this.flattenTree(this.treeCategories()));
  protected readonly rootCount      = computed(() => this.treeCategories().length);
  protected readonly subCount       = computed(() => this.flatCategories().length - this.rootCount());

  protected readonly panelCategoryId = computed(() =>
    this.panelMode() === 'edit' ? this.selectedId() : null,
  );

  constructor() {
    this.bc.set([{ label: 'Categorías' }]);
    this.loadTree();
  }

  ngAfterViewInit(): void {
    this.pageSvc.setActions(this.pageActionsTemplate);
  }

  ngOnDestroy(): void {
    this.pageSvc.clear();
  }

  private loadTree(): void {
    this.isTreeLoading.set(true);
    this.svc.getTree().subscribe({
      next: cats => { this.treeCategories.set(cats); this.isTreeLoading.set(false); },
      error: ()   => this.isTreeLoading.set(false),
    });
  }

  protected onSelect(id: number): void {
    this.selectedId.set(id);
    this.panelMode.set('edit');
  }

  protected onNew(): void {
    this.selectedId.set(null);
    this.panelMode.set('new');
  }

  protected onSaved(cat: AdminCategory): void {
    this.loadTree();
    if (this.panelMode() === 'new') {
      this.selectedId.set(null);
      this.panelMode.set('none');
    } else {
      this.selectedId.set(cat.id);
      this.panelMode.set('edit');
    }
  }

  protected onDeleted(): void {
    this.loadTree();
    this.selectedId.set(null);
    this.panelMode.set('none');
  }

  protected closePanel(): void {
    this.panelMode.set('none');
    this.selectedId.set(null);
  }

  // ── Drag & drop reparenting ─────────────────────────────────────────

  protected onReparent(event: { id: number; newParentId: number | null }): void {
    const cat = this.flatCategories().find(c => c.id === event.id);
    if (!cat) return;
    const request: CategoryRequest = {
      name:            cat.name,
      description:     cat.description ?? '',
      slug:            cat.slug,
      isActive:        cat.isActive,
      sortOrder:       cat.sortOrder,
      imageUrl:        cat.imageUrl ?? '',
      metaTitle:       cat.metaTitle ?? '',
      metaDescription: cat.metaDescription ?? '',
      parentId:        event.newParentId,
    };
    this.svc.updateCategory(event.id, request).subscribe({
      next: () => this.loadTree(),
      error: () => this.loadTree(), // reload even on error to keep state consistent
    });
  }

  // ── Tree-initiated delete ───────────────────────────────────────────

  protected onDeleteFromTree(id: number): void {
    const cat = this.flatCategories().find(c => c.id === id);
    this.deleteTargetId.set(id);
    this.deleteTargetName.set(cat?.name ?? '');
    this.showConfirmDelete.set(true);
  }

  protected confirmDeleteFromTree(): void {
    const id = this.deleteTargetId();
    if (id === null) return;
    this.showConfirmDelete.set(false);
    this.svc.deleteCategory(id).subscribe({
      next: () => {
        this.loadTree();
        if (this.selectedId() === id) {
          this.selectedId.set(null);
          this.panelMode.set('none');
        }
      },
    });
  }

  private flattenTree(cats: AdminCategory[]): AdminCategory[] {
    const result: AdminCategory[] = [];
    for (const cat of cats) {
      result.push(cat);
      if (cat.children.length) result.push(...this.flattenTree(cat.children));
    }
    return result;
  }
}
