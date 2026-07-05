import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Brand } from '../../core/models/brand.model';
import { Article } from '../../core/models/article.model';
import { BrandsService } from '../../core/services/brands.service';
import { ArticlesService } from '../../core/services/articles.service';
import { HeroCarouselComponent } from '../home/components/hero-carousel.component';
import { BrandsSectionComponent } from '../home/components/brands-section.component';
import { EditorialSectionComponent } from '../home/components/editorial-section.component';

@Component({
  selector: 'app-landing-home',
  standalone: true,
  imports: [RouterLink, HeroCarouselComponent, BrandsSectionComponent, EditorialSectionComponent],
  templateUrl: './landing-home.component.html',
})
export class LandingHomeComponent implements OnInit {
  private readonly brandsService   = inject(BrandsService);
  private readonly articlesService = inject(ArticlesService);

  protected readonly brands           = signal<Brand[]>([]);
  protected readonly articles         = signal<Article[]>([]);
  protected readonly isLoadingArticles = signal(true);

  ngOnInit(): void {
    this.brandsService.getBrands().subscribe({ next: b => this.brands.set(b) });
    this.articlesService.getArticles().subscribe({
      next:  a  => { this.articles.set(a); this.isLoadingArticles.set(false); },
      error: () => this.isLoadingArticles.set(false),
    });
  }
}
