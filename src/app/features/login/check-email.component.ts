import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LogoComponent } from '../../shared/components/logo/logo.component';
import { StarFieldComponent } from '../../shared/components/star-field.component';

@Component({
  selector: 'app-check-email',
  standalone: true,
  imports: [RouterLink, LogoComponent, StarFieldComponent],
  templateUrl: './check-email.component.html',
})
export class CheckEmailComponent {}
