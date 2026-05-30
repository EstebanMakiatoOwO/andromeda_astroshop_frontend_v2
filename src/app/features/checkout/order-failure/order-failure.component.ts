import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CheckoutBarComponent } from '../components/checkout-bar.component';
import { PublicFooterComponent } from '../../layout/footer/public-footer.component';

@Component({
  selector: 'app-order-failure',
  standalone: true,
  imports: [RouterLink, CheckoutBarComponent, PublicFooterComponent],
  templateUrl: './order-failure.component.html',
})
export class OrderFailureComponent {
  protected readonly orderNumber = 'AND-024815';
  protected readonly reasons = [
    'Fondos o límite insuficiente en la tarjeta',
    'Datos de la tarjeta ingresados incorrectamente',
    'El banco rechazó la operación por seguridad',
  ];
}
