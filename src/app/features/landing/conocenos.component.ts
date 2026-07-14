import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LandingHeroComponent, BRAND_ACCENTS } from './components/landing-hero.component';
import { LandingSectionHeadComponent } from './components/landing-section-head.component';
import { ApodFeatureComponent } from './components/apod-feature.component';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-conocenos',
  standalone: true,
  imports: [RouterLink, LandingHeroComponent, LandingSectionHeadComponent, ApodFeatureComponent],
  templateUrl: './conocenos.component.html',
})
export class ConocenosComponent {
  protected readonly theme = inject(ThemeService);

  protected readonly timeline = [
    {
      year: 'Marzo 2019',
      title: 'Nace "Bolsas Andrómeda"',
      body: 'Abrimos una página en Facebook para comercializar bolsas diseñadas especialmente para telescopios. Dos astrónomos aficionados con una solución práctica a un problema real.',
    },
    {
      year: '8 Marzo 2020',
      title: 'Se funda Andrómeda AstroShop',
      body: 'Justo antes de la pandemia decidimos dar el gran paso: cambiar el nombre y crear una tienda especializada en equipos astronómicos y astrofotografía importados desde Estados Unidos.',
    },
    {
      year: '2021',
      title: 'Crecimiento de la comunidad',
      body: 'Expandimos nuestro catálogo de marcas premium y consolidamos nuestro servicio de importación, haciendo accesibles equipos que antes eran difíciles de conseguir en México.',
    },
    {
      year: 'Hoy',
      title: 'AstroShop · AstroTurismo · AstroDome',
      body: 'Tres verticales que comparten la misma misión: acercar el universo a las personas a través de equipos de alta calidad, experiencias astronómicas y un planetario móvil itinerante.',
    },
  ];

  protected readonly misionVision = [
    {
      tag: '// misión',
      title: 'Acercar el universo a las personas',
      body: 'Ofrecer equipos astronómicos de alta calidad inspirando la curiosidad científica y construyendo una comunidad apasionada que comparta la belleza del cosmos y el arte de la astrofotografía.',
    },
    {
      tag: '// visión',
      title: 'El referente líder para la comunidad astronómica',
      body: 'Ser el referente líder en el país para la comunidad astronómica amateur y de astrofotografía, reconocidos no solo por la excelencia de nuestros equipos, sino por transformar la observación del cielo en experiencias colectivas, educativas e inolvidables.',
    },
  ];

  protected readonly valores = [
    { ico: '✨', title: 'Pasión por el Cosmos' },
    { ico: '🤝', title: 'Comunidad y Compartir' },
    { ico: '🔭', title: 'Rigor y Excelencia Técnica' },
    { ico: '📚', title: 'Accesibilidad al Conocimiento' },
  ];

  protected readonly verticales = [
    { tag: 'tienda',       name: 'AstroShop',    accent: BRAND_ACCENTS.shop,    route: '/astroshop',    cta: 'Ir a la tienda',     body: 'Telescopios, cámaras dedicadas, monturas y accesorios de marcas oficiales importados desde EE.UU.',       img: '/Banners/S30-PRO-_1_.webp' },
    { tag: 'experiencias', name: 'AstroTurismo', accent: BRAND_ACCENTS.turismo, route: '/astroturismo', cta: 'Ver experiencias',    body: 'Noches de observación, campamentos astronómicos, astrofotografía y charlas bajo los cielos más oscuros.', img: '/Astroturismo/astroturismo-1.webp' },
    { tag: 'domos',        name: 'AstroDome',    accent: BRAND_ACCENTS.dome,    route: '/astrodome',    cta: 'Pedir cotización',    body: 'Planetario móvil itinerante para escuelas, universidades, festivales y eventos corporativos.',              img: '/Astrodome/astrodome_dome.webp' },
  ];

  protected readonly equipo = [
    { name: 'Alfredo González',         role: 'Fundador',        photo: '/Andromeda_team/alfredo.webp' },
    { name: 'Alejandra Stella',         role: 'Fundadora',       photo: '/Andromeda_team/alejandra.webp' },
    { name: 'Aitana, Esteban & Anette', role: 'Staff',           photo: '/Andromeda_team/aitana_anette_esteban.webp' },
    { name: 'Daniela Neve',             role: 'Fotógrafa',       photo: '/Andromeda_team/daniela.webp' },
    { name: 'Isai',                     role: 'Líder Marketing', photo: '/Andromeda_team/isai.webp' },
    { name: 'Julio Castillo',           role: 'Camarógrafo',     photo: '/Andromeda_team/julio.webp' },
  ];

  protected readonly stats = [
    { value: '6 años',   label: 'llevando el cosmos a México' },
    { value: '+1,500',   label: 'clientes satisfechos' },
    { value: '3',        label: 'verticales de negocio' },
    { value: '5.0 ★',   label: 'estrellas en Google' },
  ];
}
