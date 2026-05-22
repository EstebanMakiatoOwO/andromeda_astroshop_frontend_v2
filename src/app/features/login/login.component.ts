import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { PublicAuthService } from '../../core/services/public-auth.service';
import { StarFieldComponent } from '../../shared/components/star-field.component';
import { LogoComponent } from '../../shared/components/logo/logo.component';
import { PasswordInputComponent } from './components/password-input.component';
import { LoyaltyTeaserComponent } from './components/loyalty-teaser.component';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password        = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, StarFieldComponent, LogoComponent, PasswordInputComponent, LoyaltyTeaserComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly auth   = inject(PublicAuthService);
  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);
  private readonly fb     = inject(FormBuilder);

  protected readonly tabs = [
    { id: 'register' as const, label: 'Crear cuenta' },
    { id: 'login'    as const, label: 'Ingresar' },
  ];
  protected readonly activeTab         = signal<'register' | 'login'>('register');
  protected readonly error             = signal<string | null>(null);
  protected readonly isLoading         = this.auth.isLoading;
  protected readonly showDuplicateModal = signal(false);
  protected readonly duplicateEmail    = signal('');

  private readonly returnUrl = this.route.snapshot.queryParams['returnUrl'] ?? '/';

  protected readonly loginForm = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected readonly registerForm = this.fb.group({
    name:            ['', Validators.required],
    email:           ['', [Validators.required, Validators.email]],
    password:        ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    terms:           [false, Validators.requiredTrue],
  }, { validators: passwordsMatch });

  protected onLogin(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.error.set(null);
    const { email, password } = this.loginForm.value;
    this.auth.login(email!, password!).subscribe({
      next:  () => this.router.navigateByUrl(this.returnUrl),
      error: (err) => {
        const msg: string = err?.error?.message ?? '';
        if (err?.status === 403 && msg) {
          this.error.set(msg);
        } else {
          this.error.set('Email o contraseña incorrectos.');
        }
      },
    });
  }

  protected onRegister(): void {
    if (this.registerForm.invalid) { this.registerForm.markAllAsTouched(); return; }
    this.error.set(null);
    const { name, email, password } = this.registerForm.value;
    this.auth.register(name!, email!, password!).subscribe({
      next:  () => this.router.navigate(['/check-email']),
      error: (err) => {
        const msg: string = err?.error?.message ?? '';
        if (msg.includes('Email already registered')) {
          const match = msg.match(/:\s*(.+)$/);
          this.duplicateEmail.set(match?.[1]?.trim() ?? this.registerForm.value.email ?? '');
          this.showDuplicateModal.set(true);
        } else {
          this.error.set('No se pudo crear la cuenta. Revisa los datos e intenta de nuevo.');
        }
      },
    });
  }

  protected goToLogin(): void {
    this.showDuplicateModal.set(false);
    this.loginForm.controls.email.setValue(this.duplicateEmail());
    this.activeTab.set('login');
  }

  protected onGuest(): void {
    this.router.navigateByUrl(this.returnUrl);
  }

  protected fieldError(form: 'login' | 'register', field: string, rule: string): boolean {
    const f = (form === 'login' ? this.loginForm : this.registerForm) as FormGroup;
    const c = f.get(field);
    return !!(c?.touched && c.errors?.[rule]);
  }

  protected passwordMismatch(): boolean {
    return !!(this.registerForm.touched && this.registerForm.errors?.['passwordMismatch']
              && this.registerForm.get('confirmPassword')?.touched);
  }
}
