import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LogoComponent } from '../../shared/components/logo/logo.component';
import { StarFieldComponent } from '../../shared/components/star-field.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [RouterLink, LogoComponent, StarFieldComponent],
  templateUrl: './privacy.component.html',
})
export class PrivacyComponent {
  protected readonly lastUpdated = '20 de mayo de 2026';
}
