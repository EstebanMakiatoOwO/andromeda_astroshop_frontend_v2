import { Directive, ElementRef, NgZone, OnDestroy, effect, inject, input } from '@angular/core';

/**
 * Renders a product's long description and gives the `.asd` template its behaviour
 * (tabs, <dialog> modals, image zoom, data-goto-tab links) through event delegation.
 * It replaces the template's own <script>, which is never executed.
 *
 * Usage: <div class="product-description" [appRichDescription]="html"></div>
 *
 * The HTML is set with innerHTML directly instead of [innerHTML]: Angular's sanitizer would
 * strip <button>, <svg> and data-* attributes the template relies on. The real security filter
 * is the backend allowlist (CatalogManagement::sanitizeDescriptionHtml); harden() below only
 * repeats the most basic cleanup as a second layer.
 */
@Directive({
  selector: '[appRichDescription]',
  standalone: true,
})
export class RichDescriptionDirective implements OnDestroy {
  readonly html = input.required<string>({ alias: 'appRichDescription' });

  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private readonly zone = inject(NgZone);

  constructor() {
    effect(() => {
      this.closeOpenDialogs();
      this.host.innerHTML = this.html();
      this.harden();
    });

    // Pure DOM work — no need to trigger Angular change detection on every click.
    this.zone.runOutsideAngular(() => {
      this.host.addEventListener('click', this.onClick);
      this.host.addEventListener('keydown', this.onKeydown);
      // 'close' doesn't bubble, so listen in the capture phase
      this.host.addEventListener('close', this.onDialogClose, true);
    });
  }

  ngOnDestroy(): void {
    this.closeOpenDialogs();
    this.host.removeEventListener('click', this.onClick);
    this.host.removeEventListener('keydown', this.onKeydown);
    this.host.removeEventListener('close', this.onDialogClose, true);
  }

  private harden(): void {
    this.host.querySelectorAll('script, style, iframe, object, embed, form').forEach(el => el.remove());
    this.host.querySelectorAll('*').forEach(el => {
      for (const attr of Array.from(el.attributes)) {
        const value = attr.value.trim().toLowerCase();
        if (attr.name.toLowerCase().startsWith('on') || value.startsWith('javascript:')) {
          el.removeAttribute(attr.name);
        }
      }
    });
  }

  private readonly onClick = (event: MouseEvent): void => {
    const target = event.target as Element;

    // Click on the backdrop of a modal (the event target is the <dialog> itself)
    if (target instanceof HTMLDialogElement) {
      target.close();
      return;
    }

    const tab = target.closest<HTMLElement>('[role="tab"]');
    if (tab && this.host.contains(tab)) {
      this.selectTab(tab);
      return;
    }

    const close = target.closest('.modal-close');
    if (close) {
      close.closest('dialog')?.close();
      return;
    }

    const modalTrigger = target.closest<HTMLElement>('[data-modal]');
    if (modalTrigger) {
      this.openDialog(this.byId(modalTrigger.dataset['modal']));
      return;
    }

    const zoom = target.closest<HTMLElement>('[data-zoom]');
    if (zoom) {
      this.openZoom(zoom);
      return;
    }

    const goto = target.closest<HTMLElement>('[data-goto-tab]');
    if (goto) {
      event.preventDefault();
      goto.closest('dialog')?.close();
      const destination = this.byId(goto.dataset['gotoTab']);
      if (destination) {
        this.selectTab(destination, true);
        destination.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  private readonly onKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const tab = (event.target as Element).closest<HTMLElement>('[role="tab"]');
    const tabs = this.tabsOf(tab);
    if (!tab || tabs.length === 0) return;
    const step = event.key === 'ArrowRight' ? 1 : tabs.length - 1;
    this.selectTab(tabs[(tabs.indexOf(tab) + step) % tabs.length], true);
  };

  private readonly onDialogClose = (): void => {
    if (!this.host.querySelector('dialog[open]')) {
      document.body.classList.remove('asd-modal-open');
    }
  };

  private selectTab(tab: HTMLElement, focus = false): void {
    for (const t of this.tabsOf(tab)) {
      const active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
      const panel = this.byId(t.getAttribute('aria-controls'));
      if (panel) {
        panel.hidden = !active;
        panel.classList.toggle('is-active', active);
      }
    }
    if (focus) tab.focus();
  }

  private tabsOf(tab: HTMLElement | null): HTMLElement[] {
    const list = tab?.closest('[role="tablist"]');
    return list ? Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]')) : [];
  }

  private openDialog(dialog: Element | null): void {
    if (!(dialog instanceof HTMLDialogElement) || dialog.open) return;
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('asd-modal-open');
  }

  private openZoom(trigger: HTMLElement): void {
    const url = trigger.dataset['zoom'] ?? '';
    if (!url.startsWith('https://')) return;
    const lightbox = this.host.querySelector('dialog.asd-lightbox');
    if (!lightbox) {
      window.open(url, '_blank', 'noopener');
      return;
    }
    // The backend drops <img src=""> placeholders, so the lightbox may arrive without one
    let image = lightbox.querySelector('img');
    if (!image) {
      image = document.createElement('img');
      lightbox.appendChild(image);
    }
    // Google Drive (lh3) rejects image requests that carry another site's Referer
    image.referrerPolicy = 'no-referrer';
    image.src = url;
    image.alt = trigger.querySelector('img')?.alt ?? '';
    this.openDialog(lightbox);
  }

  private byId(id: string | null | undefined): HTMLElement | null {
    return id ? this.host.querySelector<HTMLElement>(`#${CSS.escape(id)}`) : null;
  }

  private closeOpenDialogs(): void {
    this.host.querySelectorAll('dialog[open]').forEach(d => (d as HTMLDialogElement).close());
    document.body.classList.remove('asd-modal-open');
  }
}
