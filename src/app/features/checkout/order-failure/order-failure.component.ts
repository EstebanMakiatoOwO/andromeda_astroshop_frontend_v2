import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { CheckoutBarComponent } from '../components/checkout-bar.component';
import { PublicFooterComponent } from '../../layout/footer/public-footer.component';

@Component({
  selector: 'app-order-failure',
  standalone: true,
  imports: [RouterLink, CheckoutBarComponent, PublicFooterComponent],
  templateUrl: './order-failure.component.html',
})
export class OrderFailureComponent implements OnInit {
  private readonly cart = inject(CartService);

  ngOnInit(): void {
    this.cart.load().subscribe();
  }
  protected readonly orderNumber = 'AND-024815';
  protected readonly reasons = [
    'Fondos o límite insuficiente en la tarjeta',
    'Datos de la tarjeta ingresados incorrectamente',
    'El banco rechazó la operación por seguridad',
  ];
}
