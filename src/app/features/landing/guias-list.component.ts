import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Article } from '../../core/models/article.model';
import { ArticlesService } from '../../core/services/articles.service';
import { LandingHeroComponent } from './components/landing-hero.component';

const CATS = ['Todas', 'Primeros pasos', 'Astrofotografía', 'Equipamiento', 'Eventos del cielo', 'Ciencia'] as const;

@Component({
  selector: 'app-guias-list',
  standalone: true,
  imports: [RouterLink, LandingHeroComponent],
  templateUrl: './guias-list.component.html',
})
export class GuiasListComponent implements OnInit {
  private readonly articlesService = inject(ArticlesService);
  private readonly destroyRef      = inject(DestroyRef);

  protected readonly cats       = CATS;
  protected readonly catActiva  = signal<string>('Todas');
  protected readonly query      = signal('');
  protected readonly articles   = signal<Article[]>([]);
  protected readonly isLoading  = signal(true);

  protected readonly filtered = computed(() => {
    let list = this.articles();
    const q = this.query().toLowerCase().trim();
    if (q) list = list.filter(a => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q));
    return list;
  });

  protected readonly featured  = computed(() => this.filtered()[0] ?? null);
  protected readonly rest       = computed(() => this.filtered().slice(1));

  protected formatDate(raw: string): string {
    try {
      return new Date(raw.replace(' ', 'T')).toLocaleDateString('es-AR', {
        day: 'numeric', month: 'short', year: 'numeric',
      });
    } catch { return raw; }
  }

  ngOnInit(): void {
    this.articlesService.getArticles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next:  a  => { this.articles.set(a); this.isLoading.set(false); },
        error: () => this.isLoading.set(false),
      });
  }
}
