import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  BkToastrService,
  ToastMessage,
  ToastPosition,
} from './toastr.service';

@Component({
  selector: 'bk-toastr',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toastr.html',
  styleUrl: './toastr.css',
  encapsulation: ViewEncapsulation.None,
})
export class BkToastr {
  private readonly svc = inject(BkToastrService);

  /** Convert signal → Observable so AsyncPipe triggers change detection reliably */
  readonly toasts$ = toObservable(this.svc.toasts);
  readonly position$ = toObservable(this.svc.position);

  onClose(event: Event, id: string): void {
    event.stopPropagation();
    this.svc.close(id);
  }

  onAction(event: Event, t: ToastMessage): void {
    event.stopPropagation();
    t.actionCallback?.();
  }
}
