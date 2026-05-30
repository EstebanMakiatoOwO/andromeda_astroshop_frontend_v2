import { Component } from '@angular/core';

interface Bundle {
  tag: string;
  name: string;
  desc: string;
  items: string[];
  price: string;
  strike: string;
  saving: string;
  featured: boolean;
}

@Component({
  selector: 'app-bundles-section',
  standalone: true,
  templateUrl: './bundles-section.component.html',
})
export class BundlesSectionComponent {
  protected readonly bundles: Bundle[] = [
    {
      tag: 'principiante',
      name: 'Kit "Primer cielo"',
      desc: 'Todo lo que necesitás para empezar sin perderte en la decisión.',
      items: [
        'Telescopio refractor 90mm · montura ecuatorial',
        'Set de 3 oculares (25/10/6mm)',
        'Mapa estelar Hemisferio Sur',
        'Linterna roja LED · guía PDF',
      ],
      price: '$325,000 MXN',
      strike: '$412,500 MXN',
      saving: 'ahorrás $87,500',
      featured: false,
    },
    {
      tag: 'astrofotografía',
      name: 'Kit "Profundo"',
      desc: 'Para quien ya observa y quiere empezar a capturar lo que ve.',
      items: [
        'Telescopio Newtoniano 200mm · montura computarizada',
        'Cámara ZWO ASI224MC color',
        'Filtro CLS contra polución lumínica',
        'Software + tutorial 1-on-1 online',
      ],
      price: '$1,245,000 MXN',
      strike: '$1,520,000 MXN',
      saving: 'ahorrás $275,000',
      featured: true,
    },
    {
      tag: 'familia · niños',
      name: 'Kit "Pequeño astrónomo"',
      desc: 'Resistente, simple y entretenido. Pensado para 8-14 años.',
      items: [
        'Telescopio refractor 70mm · trípode liviano',
        'Binocular 7x35 a prueba de niños',
        'Mapa estelar interactivo',
        'Libro "El cielo del sur" tapa dura',
      ],
      price: '$89,500 MXN',
      strike: '$118,000 MXN',
      saving: 'ahorrás $28,500',
      featured: false,
    },
  ];
}
