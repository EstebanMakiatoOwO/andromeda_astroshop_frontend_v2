import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild, effect, inject, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ProductsService, ProductRequest } from '../../../../core/services/products.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { AdminPageActionsService } from '../../../../core/services/admin-page-actions.service';
import { AdminProduct, ProductCategory, ProductStatus } from '../../../../core/models/product.model';
import { badgeClass, statusLabel } from '../products.helpers';
import { ProductInfoSectionComponent } from './components/product-info-section.component';
import { ProductImagesSectionComponent } from './components/product-images-section.component';
import { ProductStockSectionComponent } from './components/product-stock-section.component';
import { ProductCategorySectionComponent } from './components/product-category-section.component';
import { ProductPreviewComponent } from './components/product-preview.component';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [
    RouterLink,
    ProductInfoSectionComponent,
    ProductImagesSectionComponent,
    ProductStockSectionComponent,
    ProductCategorySectionComponent,
    ProductPreviewComponent,
  ],
  templateUrl: './product-edit.component.html',
})
export class ProductEditComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('pageActions') private pageActionsTemplate!: TemplateRef<unknown>;

  private readonly route      = inject(ActivatedRoute);
  private readonly router     = inject(Router);
  private readonly svc        = inject(ProductsService);
  private readonly bc         = inject(BreadcrumbService);
  private readonly pageSvc    = inject(AdminPageActionsService);

  protected readonly isLoading  = signal(true);
  protected readonly hasError   = signal(false);
  protected readonly isSaving   = signal(false);
  protected readonly isNew      = signal(false);

  // form state
  protected readonly formName        = signal('');
  protected readonly formSku         = signal('');
  protected readonly formBarcode     = signal('');
  protected readonly formShortDesc   = signal('');
  protected readonly formLongDesc    = signal('');
  protected readonly formPrice       = signal(0);
  protected readonly formCostPrice   = signal(0);
  protected readonly formStock       = signal(0);
  protected readonly formThreshold   = signal(3);
  protected readonly formIsActive    = signal(true);
  protected readonly formIsCatalog   = signal(false);
  protected readonly formCategoryIds = signal<number[]>([]);
  protected readonly formBrandId     = signal<number | null>(null);
  protected readonly formImages      = signal<string[]>([]);
  protected readonly formImageFile   = signal<File | null>(null);
  protected readonly productStatus   = signal<ProductStatus>('DRAFT');

  protected readonly categories = signal<ProductCategory[]>([]);

  protected statusLabel = statusLabel;
  protected badgeClass  = badgeClass;

  constructor() {
    effect(() => {
      this.pageSvc.setBadge(badgeClass(this.productStatus()), statusLabel(this.productStatus()));
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.params['id'];
    this.isNew.set(idParam === 'new');

    this.svc.getCategories().subscribe({ next: cats => this.categories.set(cats) });

    if (this.isNew()) {
      this.bc.set([{ label: 'Productos', route: '/admin/products' }, { label: 'Nuevo producto' }]);
      this.isLoading.set(false);
    } else {
      const id = Number(idParam);
      this.bc.set([{ label: 'Productos', route: '/admin/products' }, { label: `#${id}` }]);
      this.loadProduct(id);
    }
  }

  ngAfterViewInit(): void {
    this.pageSvc.setBack('/admin/products', 'Productos');
    this.pageSvc.setActions(this.pageActionsTemplate);
  }

  ngOnDestroy(): void {
    this.pageSvc.clear();
  }

  private loadProduct(id: number): void {
    this.isLoading.set(true);
    this.svc.getProduct(id).subscribe({
      next: p => {
        this.bc.set([{ label: 'Productos', route: '/admin/products' }, { label: p.name }]);
        this.formName.set(p.name);
        this.formSku.set(p.sku);
        this.formBarcode.set(p.barcode ?? '');
        this.formShortDesc.set(p.shortDescription ?? '');
        this.formLongDesc.set(p.longDescription ?? '');
        this.formPrice.set(p.price);
        this.formCostPrice.set(p.costPrice ?? 0);
        this.formStock.set(p.stock);
        this.formThreshold.set(p.stockAlertThreshold);
        this.formIsActive.set(p.isActive);
        this.formIsCatalog.set(p.isCatalog);
        this.formCategoryIds.set(p.categories.map(c => c.id));
        this.formBrandId.set(p.brand?.id ?? null);
        this.formImages.set(p.images ?? []);
        this.productStatus.set(p.status);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  protected saveDraft(): void {
    this.save('DRAFT');
  }

  protected publish(): void {
    this.save('ACTIVE');
  }

  private save(status: ProductStatus): void {
    this.isSaving.set(true);
    const request: ProductRequest = {
      sku:                 this.formSku(),
      barcode:             this.formBarcode(),
      name:                this.formName(),
      shortDescription:    this.formShortDesc(),
      longDescription:     this.formLongDesc(),
      price:               this.formPrice(),
      costPrice:           this.formCostPrice(),
      stock:               this.formStock(),
      stockAlertThreshold: this.formThreshold(),
      isActive:            status === 'ACTIVE',
      isCatalog:           this.formIsCatalog(),
      status,
      categoryIds:         this.formCategoryIds(),
      brandId:             this.formBrandId(),
    };

    const file = this.formImageFile() ?? undefined;
    const req = this.isNew()
      ? this.svc.createProduct(request, file)
      : this.svc.updateProduct(Number(this.route.snapshot.params['id']), request, file);

    req.subscribe({
      next: saved => {
        this.productStatus.set(saved.status);
        this.isSaving.set(false);
        this.router.navigate(['/admin/products']);
      },
      error: () => this.isSaving.set(false),
    });
  }
}
