import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminCategory, CategoryRequest } from '../../../../core/models/category.model';
import { CategoriesService } from '../../../../core/services/categories.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog.component';
import { ApiValidationErrorsComponent } from '../../../../shared/components/api-validation-errors.component';

interface ApiError { message: string; errors: Record<string, string> | null; }

@Component({
  selector: 'app-category-edit-panel',
  standalone: true,
  imports: [ConfirmDialogComponent, ApiValidationErrorsComponent],
  templateUrl: './category-edit-panel.component.html',
})
export class CategoryEditPanelComponent {
  categoryId    = input<number | null>(null);
  allCategories = input.required<AdminCategory[]>();

  saved     = output<AdminCategory>();
  deleted   = output<void>();
  cancelled = output<void>();

  private readonly svc = inject(CategoriesService);

  protected readonly isLoading         = signal(false);
  protected readonly isSaving          = signal(false);
  protected readonly showConfirmDelete = signal(false);
  protected readonly apiError          = signal<ApiError | null>(null);

  protected readonly formName            = signal('');
  protected readonly formDescription     = signal('');
  protected readonly formSlug            = signal('');
  protected readonly formIsActive        = signal(true);
  protected readonly formShowInMenu      = signal(true);
  protected readonly formSortOrder       = signal(0);
  protected readonly formImageUrl        = signal('');
  protected readonly formMetaTitle       = signal('');
  protected readonly formMetaDescription = signal('');
  protected readonly formParentId        = signal<number | null>(null);

  protected readonly isNew = computed(() => this.categoryId() === null);

  protected readonly parentOptions = computed(() =>
    this.allCategories().filter(c => c.id !== this.categoryId()),
  );

  protected readonly parentName = computed(() => {
    const id = this.formParentId();
    if (!id) return null;
    return this.allCategories().find(c => c.id === id)?.name ?? null;
  });

  constructor() {
    effect(() => {
      const id = this.categoryId();
      if (id === null) {
        this.reset();
      } else {
        this.loadCategory(id);
      }
    });
  }

  private reset(): void {
    this.formName.set('');
    this.formDescription.set('');
    this.formSlug.set('');
    this.formIsActive.set(true);
    this.formShowInMenu.set(true);
    this.formSortOrder.set(0);
    this.formImageUrl.set('');
    this.formMetaTitle.set('');
    this.formMetaDescription.set('');
    this.formParentId.set(null);
    this.apiError.set(null);
    this.isLoading.set(false);
  }

  private loadCategory(id: number): void {
    this.isLoading.set(true);
    this.apiError.set(null);
    this.svc.getCategory(id).subscribe({
      next: cat => {
        this.formName.set(cat.name);
        this.formDescription.set(cat.description ?? '');
        this.formSlug.set(cat.slug);
        this.formIsActive.set(cat.isActive);
        this.formSortOrder.set(cat.sortOrder);
        this.formImageUrl.set(cat.imageUrl ?? '');
        this.formMetaTitle.set(cat.metaTitle ?? '');
        this.formMetaDescription.set(cat.metaDescription ?? '');
        this.formParentId.set(cat.parentId);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  protected autoSlug(): void {
    if (!this.formSlug()) {
      this.formSlug.set(this.toSlug(this.formName()));
    }
  }

  protected save(): void {
    this.isSaving.set(true);
    this.apiError.set(null);
    const request: CategoryRequest = {
      name:            this.formName(),
      description:     this.formDescription(),
      slug:            this.formSlug() || this.toSlug(this.formName()),
      isActive:        this.formIsActive(),
      sortOrder:       this.formSortOrder(),
      imageUrl:        this.formImageUrl(),
      metaTitle:       this.formMetaTitle(),
      metaDescription: this.formMetaDescription(),
      parentId:        this.formParentId(),
    };
    const id  = this.categoryId();
    const req = id === null
      ? this.svc.createCategory(request)
      : this.svc.updateCategory(id, request);
    req.subscribe({
      next: cat => { this.isSaving.set(false); this.saved.emit(cat); },
      error: (err: HttpErrorResponse) => {
        this.isSaving.set(false);
        const body = err.error as ApiError | null;
        this.apiError.set({
          message: body?.message ?? 'Error al guardar',
          errors:  body?.errors ?? null,
        });
      },
    });
  }

  protected requestDelete(): void {
    this.showConfirmDelete.set(true);
  }

  protected confirmDelete(): void {
    this.showConfirmDelete.set(false);
    this.isSaving.set(true);
    this.svc.deleteCategory(this.categoryId()!).subscribe({
      next: () => this.deleted.emit(),
      error: () => this.isSaving.set(false),
    });
  }

  private toSlug(name: string): string {
    return name.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }
}
