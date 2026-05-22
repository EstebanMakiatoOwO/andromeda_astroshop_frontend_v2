import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PublicAuthService } from '../../core/services/public-auth.service';
import { LogoComponent } from '../../shared/components/logo/logo.component';
import { StarFieldComponent } from '../../shared/components/star-field.component';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink, LogoComponent, StarFieldComponent],
  templateUrl: './verify-email.component.html',
})
export class VerifyEmailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly auth  = inject(PublicAuthService);

  protected readonly state = signal<'loading' | 'success' | 'error'>('loading');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'] ?? '';
    if (!token) { this.state.set('error'); return; }

    this.auth.verifyEmail(token).subscribe({
      next:  () => this.state.set('success'),
      error: () => this.state.set('error'),
    });
  }
}
