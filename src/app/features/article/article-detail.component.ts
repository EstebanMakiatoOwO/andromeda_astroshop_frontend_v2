import { Component, inject, OnInit, signal, computed, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Article } from '../../core/models/article.model';
import { ArticlesService } from '../../core/services/articles.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [RouterLink],
  // El contenido de .article-content viene de [innerHTML] (HTML crudo del back,
  // no pasa por el compilador de plantillas), así que necesita estilos sin
  // scoping para poder alcanzarlo.
  encapsulation: ViewEncapsulation.None,
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
    .article-content h1,
    .article-content h2,
    .article-content h3 {
      font-weight: 700;
      color: var(--color-ink-1);
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
    }
    .article-content h2 { font-size: 1.25rem; }
    .article-content h3 { font-size: 1.1rem; }
    .article-content p  { margin-bottom: 1rem; }
    .article-content ul,
    .article-content ol { padding-left: 1.5rem; margin-bottom: 1rem; }
    .article-content li { margin-bottom: 0.25rem; }
    .article-content table {
      display: block;
      overflow-x: auto;
      width: 100%;
      max-width: 100%;
      margin-bottom: 1.5rem;
      border-collapse: collapse;
      border-spacing: 0;
      border: none;
      font-size: 0.85rem;
    }
    .article-content th,
    .article-content td {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--color-line);
      text-align: left;
      vertical-align: top;
    }
    .article-content th {
      background: var(--color-surface-2);
      color: var(--color-ink-1);
      font-weight: 600;
      white-space: nowrap;
    }
    .article-content tbody tr:nth-child(even) {
      background: var(--color-surface-2);
    }
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
