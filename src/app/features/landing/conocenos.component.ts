import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LandingHeroComponent, BRAND_ACCENTS } from './components/landing-hero.component';
import { LandingSectionHeadComponent } from './components/landing-section-head.component';

@Component({
  selector: 'app-conocenos',
  standalone: true,
  imports: [RouterLink, LandingHeroComponent, LandingSectionHeadComponent],
  templateUrl: './conocenos.component.html',
})
export class ConocenosComponent {
  protected readonly timeline = [
    { year: '2016', title: 'Las primeras noches', body: 'Un grupo de amigos con un Newtoniano prestado empieza a organizar observaciones abiertas en Alta Gracia.' },
    { year: '2018', title: 'Nace AstroTurismo', body: 'Formalizamos las noches de observación como experiencias turísticas en las Sierras Grandes.' },
    { year: '2021', title: 'Abre AstroShop', body: 'Ante la falta de equipamiento serio en el país, montamos la tienda online con marcas oficiales.' },
    { year: '2024', title: 'AstroDome', body: 'Desarrollamos un domo portátil para llevar observatorios a escuelas, eventos y campamentos.' },
  ];

  protected readonly misionVision = [
    { tag: '// misión', title: 'Democratizar la astronomía', body: 'Que cualquiera —sin importar edad ni presupuesto— pueda tener una primera experiencia real bajo un cielo estrellado y quiera volver.' },
    { tag: '// visión', title: 'El observatorio más grande es el cielo', body: 'Ser el punto de encuentro de la comunidad astronómica del centro del país: divulgación, equipamiento y experiencias en un solo lugar.' },
  ];

  protected readonly valores = [
    { ico: '🔭', title: 'Rigor',        desc: 'Ciencia bien contada, sin humo.' },
    { ico: '🤝', title: 'Comunidad',    desc: 'Nadie mira el cielo solo.' },
    { ico: '🌱', title: 'Accesible',    desc: 'Puertas abiertas a principiantes.' },
    { ico: '🌎', title: 'Cielo del sur', desc: 'Orgullo por lo que se ve desde acá.' },
  ];

  protected readonly verticales = [
    { tag: 'tienda',       name: 'AstroShop',    accent: BRAND_ACCENTS.shop,    route: '/astroshop',    cta: 'Ir a la tienda',     body: 'Telescopios, binoculares y accesorios de marcas oficiales, con envío a todo el país.' },
    { tag: 'experiencias', name: 'AstroTurismo', accent: BRAND_ACCENTS.turismo, route: '/astroturismo', cta: 'Ver experiencias',    body: 'Noches de observación, campamentos astronómicos y salidas de astrofotografía en las sierras.' },
    { tag: 'domos',        name: 'AstroDome',    accent: BRAND_ACCENTS.dome,    route: '/astrodome',    cta: 'Pedir cotización',    body: 'Domo portátil para llevar el cielo a escuelas, eventos corporativos y campamentos.' },
  ];

  protected readonly equipo = [
    { name: 'Lucía Fernández', role: 'Fundadora · divulgadora',    ico: '👩‍🚀' },
    { name: 'Martín Ávalos',   role: 'Astrofotógrafo · guía',       ico: '📷' },
    { name: 'Sofía Ledesma',   role: 'Turismo · experiencias',      ico: '🗺️' },
    { name: 'Diego Roldán',    role: 'AstroShop · equipamiento',    ico: '🔭' },
  ];

  protected readonly stats = [
    { value: '9 años',   label: 'acercando el cielo' },
    { value: '+12.000',  label: 'personas en observaciones' },
    { value: '+40',      label: 'escuelas visitadas con AstroDome' },
    { value: '4.9 ★',   label: 'en experiencias de turismo' },
  ];
}
