import { Component, computed, inject, OnInit, signal, DestroyRef, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { PublicCategory } from '../../core/models/public-category.model';
import { PublicCategoriesService } from '../../core/services/public-categories.service';
import { StoreConfigService } from '../../core/services/store-config.service';
import { ThemeService } from '../../core/services/theme.service';
import { PublicNavbarComponent } from './navbar/public-navbar.component';
import { PublicFooterComponent } from './footer/public-footer.component';
import { StarFieldComponent } from '../../shared/components/star-field.component';
import { PhotoLightboxComponent } from '../../shared/components/photo-lightbox.component';
import { PhotoLightboxService } from '../../core/services/photo-lightbox.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, PublicNavbarComponent, PublicFooterComponent, StarFieldComponent, PhotoLightboxComponent],
  templateUrl: './public-layout.component.html',
})
export class PublicLayoutComponent implements OnInit {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef<HTMLElement>;

  private readonly categoriesService = inject(PublicCategoriesService);
  private readonly router            = inject(Router);
  private readonly destroyRef        = inject(DestroyRef);
  protected readonly storeConfig     = inject(StoreConfigService);
  protected readonly theme           = inject(ThemeService);
  protected readonly lightbox        = inject(PhotoLightboxService);

  protected readonly starColor = computed(() => this.theme.isDark() ? 'white' : '#1e1b4b');
  protected readonly categories = signal<PublicCategory[]>([]);

  ngOnInit(): void {
    this.storeConfig.load().subscribe(enabled => {
      if (enabled) {
        this.categoriesService.getTree().subscribe(cats => this.categories.set(cats));
      }
    });

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      setTimeout(() => {
        // Intentamos todos los posibles scroll containers
        try { window.scrollTo(0, 0); } catch {}
        try { document.documentElement.scrollTop = 0; } catch {}
        try { document.body.scrollTop = 0; } catch {}
        try { this.scrollContainer?.nativeElement?.scrollTo(0, 0); } catch {}
      }, 50);
    });
  }
}
