/**
 * DialogRef — Handle returned to callers by `DialogService.open()`.
 *
 * Architecture Decision:
 * ─────────────────────
 * Wraps CDK's `DialogRef` to add:
 *  • WAAPI leave-animation before CDK tears down the overlay.
 *  • Per-instance `afterOpened()` observable (CDK only has a service-level
 *    `afterOpened` Subject).
 *  • The same familiar API shape used by callers (`close`, `afterClosed`,
 *    `backdropClick`, `keydownEvents`, `componentInstance`).
 *
 * CDK's `DialogRef<R, C>` has Result first, Component second.
 * Ours keeps `<T, R>` (Component first, Result second) to match the
 * convention consumers already use.
 */

import { DialogRef as CdkDialogRef } from '@angular/cdk/dialog';
import { Observable, Subject } from 'rxjs';

/**
 * Minimal interface for the container's capabilities.
 * Avoids a direct import of `DialogContainerComponent` in this file
 * (container imports nothing from ref, so no cycle, but this keeps
 * the coupling lightweight).
 *
 * The optional ARIA methods are inherited from `CdkDialogContainer`
 * and used by `BkDialogTitle` to register/deregister title IDs for
 * the `aria-labelledby` attribute.
 */
export interface DialogAnimatable {
  playLeaveAnimation(): Promise<void>;
  _addAriaLabelledBy?(id: string): void;
  _removeAriaLabelledBy?(id: string): void;
}

export class DialogRef<T = unknown, R = unknown> {
  /** Unique dialog identifier (managed by CDK). */
  readonly id: string;

  /** Instance of the component rendered inside the dialog. */
  componentInstance!: T;

  // ──── Internal wiring (set by DialogService) ──────────────────────────

  /** @internal Container reference for leave animation. */
  _containerInstance!: DialogAnimatable;

  /** @internal Prevent double-close. */
  private _closing = false;

  /** @internal Per-instance afterOpened Subject. */
  private readonly _afterOpened$ = new Subject<void>();

  constructor(
    /**
     * @internal Wrapped CDK ref.
     * Typed as `CdkDialogRef<any>` to avoid deep generic-variance issues
     * that arise from CDK's `config.providers` callback signature.
     * The public API (`afterClosed`, etc.) re-types the observables.
     */
    readonly _cdkRef: CdkDialogRef<any>,
  ) {
    this.id = _cdkRef.id;
  }

  // ──── Public API ──────────────────────────────────────────────────────

  /**
   * Close the dialog, optionally returning a result.
   * Plays the WAAPI leave animation, then delegates to CDK for cleanup.
   */
  close(result?: R): void {
    if (this._closing) return;
    this._closing = true;
    this._runCloseSequence(result);
  }

  /**
   * Observable that emits (and completes) once after the dialog has been
   * removed from the DOM and all cleanup is done.
   */
  afterClosed(): Observable<R | undefined> {
    return this._cdkRef.closed as Observable<R | undefined>;
  }

  /**
   * Observable that emits (and completes) when the enter animation
   * finishes and the dialog is fully visible.
   */
  afterOpened(): Observable<void> {
    return this._afterOpened$.asObservable();
  }

  /**
   * Observable of backdrop / outside-pointer click events.
   */
  backdropClick(): Observable<MouseEvent> {
    return this._cdkRef.outsidePointerEvents;
  }

  /**
   * Observable of keyboard events dispatched while this dialog is open.
   */
  keydownEvents(): Observable<KeyboardEvent> {
    return this._cdkRef.keydownEvents;
  }

  // ──── Internal helpers ────────────────────────────────────────────────

  /** @internal Called by the container once the enter animation finishes. */
  _emitOpened(): void {
    this._afterOpened$.next();
    this._afterOpened$.complete();
  }

  /** Play leave animation, then close via CDK. */
  private async _runCloseSequence(result?: R): Promise<void> {
    try {
      await this._containerInstance.playLeaveAnimation();
    } catch {
      // Animation may fail in SSR / test — proceed anyway.
    }
    this._cdkRef.close(result);
  }
}
