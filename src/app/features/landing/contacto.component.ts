import { AfterViewInit, Component, ElementRef, ViewChild, computed, signal } from '@angular/core';
import { LandingHeroComponent } from './components/landing-hero.component';
import emailjs from '@emailjs/browser';

const SERVICE_ID    = 'service_fz6diz1';
const TEMPLATE_ID   = 'template_zp4cuwt';
const PUBLIC_KEY    = 'dAmn5WIuXww39qkGU';
const RECAPTCHA_KEY = '6LcOZ2QrAAAAAIuRZHlsQEF9dk947ysZWUELG8T-';

emailjs.init({ publicKey: PUBLIC_KEY, blockHeadless: true });

const EMAIL_MAP: Record<string, string> = {
  'AstroShop':    'astroshop@andromedaastroshop.com',
  'AstroTurismo': 'astroturismo@andromedaastroshop.com',
  'AstroDome':    'astrodome@andromedaastroshop.com',
  'Prensa':       'stella@andromedaastroshop.com',
  'Otro':         'astroshop@andromedaastroshop.com',
};

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [LandingHeroComponent],
  templateUrl: './contacto.component.html',
})
export class ContactoComponent implements AfterViewInit {
  @ViewChild('recaptchaContainer') private recaptchaContainer!: ElementRef;
  private widgetId: number | null = null;
  protected readonly temas      = ['AstroShop', 'AstroTurismo', 'AstroDome', 'Prensa', 'Otro'];
  protected readonly temaActivo = signal('AstroShop');

  protected readonly nombre  = signal('');
  protected readonly email   = signal('');
  protected readonly mensaje = signal('');

  protected readonly enviando   = signal(false);
  protected readonly enviado    = signal(false);
  protected readonly error      = signal('');
  protected readonly captchaOk  = signal(false);

  protected readonly emailDestino = computed(() => EMAIL_MAP[this.temaActivo()]);

  protected readonly datos = [
    { ico: '💬', tipo: 'WhatsApp AstroShop',  valor: '+52 55 1267 2026',                   sub: 'respuesta rápida' },
    { ico: '💬', tipo: 'WhatsApp AstroDome',   valor: '+52 442 715 1880',                   sub: 'cotizaciones y eventos' },
    { ico: '✉️', tipo: 'AstroShop',           valor: 'astroshop@andromedaastroshop.com',    sub: '' },
    { ico: '✉️', tipo: 'AstroTurismo',        valor: 'astroturismo@andromedaastroshop.com', sub: '' },
    { ico: '✉️', tipo: 'AstroDome',           valor: 'astrodome@andromedaastroshop.com',    sub: '' },
  ];

  ngAfterViewInit(): void {
    const tryRender = () => {
      if ((window as any).grecaptcha?.render) {
        this.widgetId = (window as any).grecaptcha.render(
          this.recaptchaContainer.nativeElement,
          {
            sitekey:          RECAPTCHA_KEY,
            callback:         () => this.captchaOk.set(true),
            'expired-callback': () => this.captchaOk.set(false),
          }
        );
      } else {
        setTimeout(tryRender, 200);
      }
    };
    tryRender();
  }

  private checkRateLimit(): boolean {
    const KEY   = 'contact_submissions';
    const LIMIT = 2;
    const now   = Date.now();
    const DAY   = 86_400_000;

    const raw    = localStorage.getItem(KEY);
    const stamps: number[] = raw ? JSON.parse(raw) : [];
    const recent = stamps.filter(t => now - t < DAY);

    if (recent.length >= LIMIT) return false;

    recent.push(now);
    localStorage.setItem(KEY, JSON.stringify(recent));
    return true;
  }

  protected async enviar(): Promise<void> {
    if (!this.nombre() || !this.email() || !this.mensaje()) {
      this.error.set('Por favor completa nombre, email y mensaje.');
      return;
    }

    const recaptchaToken = (window as any).grecaptcha?.getResponse(this.widgetId ?? undefined);
    if (!recaptchaToken) {
      this.error.set('Por favor completa el reCAPTCHA.');
      return;
    }

    if (!this.checkRateLimit()) {
      this.error.set('Límite alcanzado: máximo 2 mensajes por día.');
      return;
    }

    this.enviando.set(true);
    this.error.set('');

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        to_email:              this.emailDestino(),
        nombre:                this.nombre(),
        email:                 this.email(),
        reply_to:              this.email(),
        tema:                  this.temaActivo(),
        mensaje:               this.mensaje(),
        'g-recaptcha-response': recaptchaToken,
      }, PUBLIC_KEY);

      this.enviado.set(true);
      this.nombre.set('');
      this.email.set('');
      this.mensaje.set('');
      (window as any).grecaptcha?.reset(this.widgetId ?? undefined);
      this.captchaOk.set(false);
      setTimeout(() => this.enviado.set(false), 5000);
    } catch {
      this.error.set('Hubo un error al enviar. Intenta de nuevo.');
    } finally {
      this.enviando.set(false);
    }
  }
}
