import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  open          = input.required<boolean>();
  title         = input<string>('¿Estás seguro?');
  message       = input<string>('Esta acción no se puede deshacer.');
  confirmLabel  = input<string>('Eliminar');
  cancelLabel   = input<string>('Cancelar');
  danger        = input<boolean>(true);

  confirmed = output<void>();
  cancelled = output<void>();
}
