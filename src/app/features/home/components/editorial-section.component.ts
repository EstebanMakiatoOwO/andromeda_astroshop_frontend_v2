import { Component } from '@angular/core';

interface EditorialCard {
  tag: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-editorial-section',
  standalone: true,
  templateUrl: './editorial-section.component.html',
})
export class EditorialSectionComponent {
  protected readonly cards: EditorialCard[] = [
    {
      tag: 'Guía',
      title: 'Cómo elegir tu primer telescopio',
      description: 'Todo lo que necesitás saber antes de hacer tu primera compra: apertura, montura y oculares.',
    },
    {
      tag: 'Tutorial',
      title: 'Astrofotografía con celular: guía práctica',
      description: 'Capturá la Luna y los planetas brillantes con tu smartphone usando accesorios simples.',
    },
    {
      tag: 'Top 10',
      title: 'Los mejores objetos del cielo del invierno',
      description: 'Nebulosas, cúmulos y galaxias visibles a simple vista o con binoculares en la temporada.',
    },
  ];
}
