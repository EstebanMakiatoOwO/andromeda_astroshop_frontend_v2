import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CartService } from './core/services/cart.service';
import { StoreConfigService } from './core/services/store-config.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
  styles: [':host { display: block; height: 100%; }'],
})
export class App implements OnInit {
  private readonly cart        = inject(CartService);
  private readonly storeConfig = inject(StoreConfigService);

  ngOnInit(): void {
    this.storeConfig.load().subscribe(enabled => {
      if (enabled) {
        this.cart.load().subscribe();
      }
    });
  }
}
