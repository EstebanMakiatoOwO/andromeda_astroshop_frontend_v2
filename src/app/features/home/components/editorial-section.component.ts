import { Component, input, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Article } from '../../../core/models/article.model';

interface StaticCard {
  tag: string;
  title: string;
  excerpt: string;
}

const FALLBACK: StaticCard[] = [
  {
    tag: 'Guía',
    title: 'Cómo elegir tu primer telescopio',
    excerpt: 'Todo lo que necesitás saber antes de hacer tu primera compra: apertura, montura y oculares.',
  },
  {
    tag: 'Tutorial',
    title: 'Astrofotografía con celular: guía práctica',
    excerpt: 'Capturá la Luna y los planetas brillantes con tu smartphone usando accesorios simples.',
  },
  {
    tag: 'Top 10',
    title: 'Los mejores objetos del cielo del invierno',
    excerpt: 'Nebulosas, cúmulos y galaxias visibles a simple vista o con binoculares en la temporada.',
  },
];

@Component({
  selector: 'app-editorial-section',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './editorial-section.component.html',
})
export class EditorialSectionComponent {
  readonly articles = input<Article[]>([]);
  readonly isLoading = input(false);

  protected readonly displayItems = computed(() => {
    const arts = this.articles();
    if (arts.length > 0) return arts.slice(0, 3);
    return null;
  });

  protected readonly fallback = FALLBACK;
}
