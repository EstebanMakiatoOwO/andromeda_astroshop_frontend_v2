import { Component, signal, HostListener } from '@angular/core';

@Component({
  selector: 'app-loyalty-banner',
  standalone: true,
  templateUrl: './loyalty-banner.component.html',
})
export class LoyaltyBannerComponent {
  protected readonly modalOpen = signal(false);

  protected openModal(): void  { this.modalOpen.set(true); }
  protected closeModal(): void { this.modalOpen.set(false); }

  @HostListener('document:keydown.escape')
  protected onEscape(): void { this.modalOpen.set(false); }
}
