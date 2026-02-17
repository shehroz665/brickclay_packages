import { Injectable, signal, computed, ApplicationRef, ComponentRef, createComponent, EnvironmentInjector } from '@angular/core';
import { BkToastr } from './toastr';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ToastSeverity = 'success' | 'error' | 'warn' | 'info' | 'default';

export type ToastPosition =
  | 'top-left'
  | 'top-right'
  | 'top-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'bottom-center';

export interface ToastConfig {
  summary: string;
  detail?: string;
  severity?: ToastSeverity;
  timeOut?: number;
  sticky?: boolean;
  icon?: boolean;
  actionLabel?: string;
  actionCallback?: () => void;
}

/** Options for convenience methods (severity is set by the method itself) */
export interface ToastMethodOptions extends Omit<ToastConfig, 'severity'> {
  summary: string;
}

export interface ToastMessage extends ToastConfig {
  readonly id: string;
  readonly severity: ToastSeverity;
  readonly timeOut: number;
  readonly sticky: boolean;
  readonly icon: boolean;
  leaving: boolean;
}

// ─── Service ─────────────────────────────────────────────────────────────────

let _toastId = 0;

@Injectable({ providedIn: 'root' })
export class BkToastrService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = computed(() => this._toasts());

  private readonly _position = signal<ToastPosition>('top-right');
  readonly position = computed(() => this._position());

  private componentRef: ComponentRef<BkToastr> | null = null;

  constructor(
    private readonly appRef: ApplicationRef,
    private readonly injector: EnvironmentInjector
  ) {}

  private initializeContainer(): void {
    if (this.componentRef) return;

    // Check if we're in browser environment
    if (typeof document === 'undefined' || !document.body) {
      // If document.body doesn't exist yet, wait for it
      setTimeout(() => this.initializeContainer(), 0);
      return;
    }

    // Create component dynamically
    this.componentRef = createComponent(BkToastr, {
      environmentInjector: this.injector,
    });

    // Attach to DOM
    document.body.appendChild(this.componentRef.location.nativeElement);

    // Register for change detection
    // Note: We don't call appRef.tick() here to avoid recursive tick calls
    // Angular will automatically detect changes for the attached view
    this.appRef.attachView(this.componentRef.hostView);
  }

  /** Show a toast with full config */
  show(config: ToastConfig): string {
    // Initialize container on first toast
    this.initializeContainer();

    const id = `toast-${++_toastId}`;

    const toast: ToastMessage = {
      ...config,
      id,
      severity: config.severity ?? 'info',
      timeOut: config.timeOut ?? 3000,
      sticky: config.sticky ?? false,
      icon: config.icon !== false,
      leaving: false,
    };

    this._toasts.update(list => [...list, toast]);

    if (!toast.sticky) {
      setTimeout(() => this.close(id), toast.timeOut);
    }

    return id;
  }

  /** Convenience – info toast */
  info(options: ToastMethodOptions): string;
  info(summary: string, detail?: string, extra?: Partial<ToastMethodOptions>): string;
  info(summaryOrOptions: string | ToastMethodOptions, detail?: string, extra?: Partial<ToastMethodOptions>): string {
    if (typeof summaryOrOptions === 'string') {
      return this.show({ ...extra, summary: summaryOrOptions, detail, severity: 'info' });
    }
    return this.show({ ...summaryOrOptions, severity: 'info' });
  }

  /** Convenience – success toast */
  success(options: ToastMethodOptions): string;
  success(summary: string, detail?: string, extra?: Partial<ToastMethodOptions>): string;
  success(summaryOrOptions: string | ToastMethodOptions, detail?: string, extra?: Partial<ToastMethodOptions>): string {
    if (typeof summaryOrOptions === 'string') {
      return this.show({ ...extra, summary: summaryOrOptions, detail, severity: 'success' });
    }
    return this.show({ ...summaryOrOptions, severity: 'success' });
  }

  /** Convenience – error toast */
  error(options: ToastMethodOptions): string;
  error(summary: string, detail?: string, extra?: Partial<ToastMethodOptions>): string;
  error(summaryOrOptions: string | ToastMethodOptions, detail?: string, extra?: Partial<ToastMethodOptions>): string {
    if (typeof summaryOrOptions === 'string') {
      return this.show({ ...extra, summary: summaryOrOptions, detail, severity: 'error' });
    }
    return this.show({ ...summaryOrOptions, severity: 'error' });
  }

  /** Convenience – warning toast */
  warn(options: ToastMethodOptions): string;
  warn(summary: string, detail?: string, extra?: Partial<ToastMethodOptions>): string;
  warn(summaryOrOptions: string | ToastMethodOptions, detail?: string, extra?: Partial<ToastMethodOptions>): string {
    if (typeof summaryOrOptions === 'string') {
      return this.show({ ...extra, summary: summaryOrOptions, detail, severity: 'warn' });
    }
    return this.show({ ...summaryOrOptions, severity: 'warn' });
  }

  /** Convenience – default / neutral toast */
  default(options: ToastMethodOptions): string;
  default(summary: string, detail?: string, extra?: Partial<ToastMethodOptions>): string;
  default(summaryOrOptions: string | ToastMethodOptions, detail?: string, extra?: Partial<ToastMethodOptions>): string {
    if (typeof summaryOrOptions === 'string') {
      return this.show({ ...extra, summary: summaryOrOptions, detail, severity: 'default' });
    }
    return this.show({ ...summaryOrOptions, severity: 'default' });
  }

  /** Close a single toast (triggers leave animation first) */
  close(id: string): void {
    this._toasts.update(list =>
      list.map(t => (t.id === id ? { ...t, leaving: true } : t)),
    );
    setTimeout(() => {
      this._toasts.update(list => list.filter(t => t.id !== id));
    }, 300);
  }

  /** Clear every toast */
  clear(): void {
    this._toasts.update(list => list.map(t => ({ ...t, leaving: true })));
    setTimeout(() => this._toasts.set([]), 300);
  }

  /** Set the position for toast notifications */
  setPosition(position: ToastPosition): void {
    // Initialize container if not already created
    this.initializeContainer();
    this._position.set(position);
  }
}
