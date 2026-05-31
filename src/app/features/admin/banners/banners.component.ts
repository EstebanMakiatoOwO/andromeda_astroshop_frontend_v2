import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BannerService, Banner, BannerRequest } from '../../../core/services/banner.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';

@Component({
  selector: 'app-admin-banners',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './banners.component.html',
})
export class AdminBannersComponent implements OnInit {
  private readonly svc = inject(BannerService);
  private readonly bc  = inject(BreadcrumbService);

  protected readonly banners    = signal<Banner[]>([]);
  protected readonly isLoading  = signal(true);
  protected readonly showForm   = signal(false);
  protected readonly saving     = signal(false);
  protected readonly editingId  = signal<number | null>(null);

  protected form: BannerRequest = this.emptyForm();

  constructor() {
    this.bc.set([{ label: 'Banners' }]);
  }

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.isLoading.set(true);
    // Admin needs all banners including inactive — fetch from public endpoint for now
    this.svc.getBanners().subscribe({
      next: bs => { this.banners.set(bs); this.isLoading.set(false); },
      error: ()  => this.isLoading.set(false),
    });
  }

  protected openNew(): void {
    this.editingId.set(null);
    this.form = this.emptyForm();
    this.showForm.set(true);
  }

  protected openEdit(b: Banner): void {
    this.editingId.set(b.id);
    this.form = {
      title:      b.title,
      imageUrl:   b.imageUrl,
      linkUrl:    b.linkUrl ?? '',
      sortOrder:  b.sortOrder,
      isActive:   b.isActive,
    };
    this.showForm.set(true);
  }

  protected cancel(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  protected save(): void {
    if (!this.form.title || !this.form.imageUrl) return;
    this.saving.set(true);
    const req: BannerRequest = {
      ...this.form,
      linkUrl: this.form.linkUrl || null,
    };
    const id = this.editingId();
    const op$ = id ? this.svc.updateBanner(id, req) : this.svc.createBanner(req);
    op$.subscribe({
      next: () => { this.showForm.set(false); this.saving.set(false); this.load(); },
      error: () => this.saving.set(false),
    });
  }

  protected delete(b: Banner): void {
    if (!confirm(`¿Eliminar "${b.title}"?`)) return;
    this.svc.deleteBanner(b.id).subscribe({ next: () => this.load() });
  }

  private emptyForm(): BannerRequest {
    return { title: '', imageUrl: '', linkUrl: '', sortOrder: 0, isActive: 1 };
  }
}
