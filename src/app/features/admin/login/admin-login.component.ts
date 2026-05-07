import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AUTH_SERVICE_TOKEN } from '../../../core/tokens/auth.tokens';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-login.component.html',
})
export class AdminLoginComponent {
  private readonly authService = inject(AUTH_SERVICE_TOKEN);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly themeService = inject(ThemeService);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isLoading = this.authService.isLoading;

  protected readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [false],
  });

  protected get emailField() {
    return this.loginForm.controls.email;
  }

  protected get passwordField() {
    return this.loginForm.controls.password;
  }

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    const { email, password, rememberMe } = this.loginForm.getRawValue();

    this.authService.login({ email, password }, rememberMe).subscribe({
      next: () => this.router.navigate(['/admin/dashboard']),
      error: (err: unknown) => {
        const message =
          err instanceof Error ? err.message : 'Credenciales incorrectas. Inténtalo de nuevo.';
        this.errorMessage.set(message);
      },
    });
  }
}
