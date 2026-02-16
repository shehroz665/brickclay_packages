import { Injectable, signal, computed } from '@angular/core';

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

  /** Show a toast with full config */
  show(config: ToastConfig): string {
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
}
