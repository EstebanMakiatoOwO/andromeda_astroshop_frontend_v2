import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Article } from '../../core/models/article.model';
import { ArticlesService } from '../../core/services/articles.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-16">

      @if (isLoading()) {
        <div class="animate-pulse flex flex-col gap-4">
          <div class="h-6 w-2/3 rounded bg-surface-3"></div>
          <div class="h-3 w-1/3 rounded bg-surface-3"></div>
          <div class="aspect-video rounded-xl bg-surface-3 mt-4"></div>
          <div class="h-3 w-full rounded bg-surface-3"></div>
          <div class="h-3 w-5/6 rounded bg-surface-3"></div>
          <div class="h-3 w-4/6 rounded bg-surface-3"></div>
        </div>

      } @else if (article()) {
        <a routerLink="/" class="text-xs text-ink-3 hover:text-accent transition-colors mb-6 inline-block">
          ← Volver al inicio
        </a>

        <h1 class="text-2xl md:text-3xl font-bold text-ink-1 leading-snug mb-2">
          {{ article()!.title }}
        </h1>

        <p class="text-xs text-ink-3 mb-8">{{ formatDate(article()!.publishedAt) }}</p>

        @if (article()!.coverImage) {
          <img [src]="article()!.coverImage!"
               [alt]="article()!.title"
               class="w-full rounded-xl object-cover mb-8"
               style="aspect-ratio: 16/9;"
               loading="lazy" />
        }

        @if (article()!.excerpt) {
          <p class="text-base text-ink-2 font-medium mb-6 leading-relaxed border-l-2 pl-4"
             style="border-color: var(--color-accent)">
            {{ article()!.excerpt }}
          </p>
        }

        <div class="text-sm text-ink-2 leading-relaxed article-content"
             [innerHTML]="safeContent()">
        </div>

      } @else {
        <a routerLink="/" class="text-xs text-ink-3 hover:text-accent transition-colors mb-6 inline-block">
          ← Volver al inicio
        </a>
        <p class="text-ink-3 mt-4">Artículo no encontrado.</p>
      }

    </div>
  `,
  styles: [`
    .article-content :global(h1),
    .article-content :global(h2),
    .article-content :global(h3) {
      font-weight: 700;
      color: var(--color-ink-1);
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
    }
    .article-content :global(h2) { font-size: 1.25rem; }
    .article-content :global(h3) { font-size: 1.1rem; }
    .article-content :global(p)  { margin-bottom: 1rem; }
    .article-content :global(ul),
    .article-content :global(ol) { padding-left: 1.5rem; margin-bottom: 1rem; }
    .article-content :global(li) { margin-bottom: 0.25rem; }
  `],
})
export class ArticleDetailComponent implements OnInit {
  private readonly route     = inject(ActivatedRoute);
  private readonly service   = inject(ArticlesService);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly article   = signal<Article | null>(null);
  protected readonly isLoading = signal(true);

  protected readonly safeContent = computed((): SafeHtml => {
    const a = this.article();
    if (!a) return '';
    let html = a.content;
    if (a.coverImage) {
      const escaped = a.coverImage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp(`<img[^>]*src=["']${escaped}["'][^>]*>`, 'i'), '');
    }
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  protected formatDate(raw: string): string {
    try {
      const iso = raw.replace(' ', 'T');
      return new Date(iso).toLocaleDateString('es-MX', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
    } catch {
      return raw;
    }
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => this.service.getArticle(params.get('slug')!))
    ).subscribe({
      next:  a  => { this.article.set(a); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }
}
