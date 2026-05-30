import { Component, input } from '@angular/core';

export interface TrackingStep {
  label: string;
  sub: string;
  done: boolean;
  active: boolean;
}

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  templateUrl: './order-tracking.component.html',
})
export class OrderTrackingComponent {
  steps = input.required<TrackingStep[]>();
}
