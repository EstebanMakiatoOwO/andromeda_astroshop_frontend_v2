import { Component } from '@angular/core';
import { LogoComponent } from '../../shared/components/logo/logo.component';
import { StarFieldComponent } from '../../shared/components/star-field.component';

@Component({
  selector: 'app-check-email',
  standalone: true,
  imports: [LogoComponent, StarFieldComponent],
  templateUrl: './check-email.component.html',
})
export class CheckEmailComponent {}
