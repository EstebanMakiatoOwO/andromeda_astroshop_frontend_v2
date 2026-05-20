import { Component } from '@angular/core';
import { StarFieldComponent } from '../../../shared/components/star-field.component';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [StarFieldComponent],
  templateUrl: './hero-section.component.html',
})
export class HeroSectionComponent {}
