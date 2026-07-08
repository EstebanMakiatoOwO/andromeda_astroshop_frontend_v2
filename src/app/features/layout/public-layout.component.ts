import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicCategory } from '../../core/models/public-category.model';
import { PublicCategoriesService } from '../../core/services/public-categories.service';
import { StoreConfigService } from '../../core/services/store-config.service';
import { PublicNavbarComponent } from './navbar/public-navbar.component';
import { PublicFooterComponent } from './footer/public-footer.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, PublicNavbarComponent, PublicFooterComponent],
  templateUrl: './public-layout.component.html',
})
export class PublicLayoutComponent implements OnInit {
  private readonly categoriesService = inject(PublicCategoriesService);
  protected readonly storeConfig     = inject(StoreConfigService);

  protected readonly categories = signal<PublicCategory[]>([]);

  ngOnInit(): void {
    if (this.storeConfig.ecommerceEnabled()) {
      this.categoriesService.getTree().subscribe(cats => this.categories.set(cats));
    }
  }
}
