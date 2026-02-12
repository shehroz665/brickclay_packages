/**
 * DialogService — The core engine of the custom dialog system.
 *
 * Architecture Decision:
 * ─────────────────────
 * Built on top of Angular CDK's `Dialog` service (the same foundation
 * that `MatDialog` uses internally):
 *
 *  1. CDK creates the overlay, backdrop, scroll-blocking, focus-trap,
 *     z-index stacking, and unique ID management — battle-tested infra
 *     shared with every Angular Material dialog in the ecosystem.
 *
 *  2. We provide our own `DialogContainerComponent` (extending
 *     `CdkDialogContainer`) for WAAPI animations and panel styling.
 *
 *  3. We wrap CDK's `DialogRef` in our own `DialogRef` to add the
 *     leave-animation step before CDK tears down the overlay, and to
 *     expose the same familiar API shape (`afterClosed()`, etc.).
 *
 *  4. Configuration is merged DEFAULT → GLOBAL → per-call, then mapped
 *     to CDK's native config with our extras carried via an internal
 *     injection token.
 *
 * What CDK handles for us (no custom code needed):
 * ─────────────────────────────────────────────────
 *   ✓ Unique dialog IDs (throws on collision)
 *   ✓ Z-index stacking via `.cdk-overlay-container`
 *   ✓ Focus trap (tab key stays inside dialog)
 *   ✓ Auto-focus / restore-focus
 *   ✓ Scroll blocking (BlockScrollStrategy)
 *   ✓ Backdrop rendering and click detection
 *   ✓ Keyboard event forwarding
 *   ✓ Overlay DOM lifecycle (create → attach → detach → dispose)
 *
 * Memory safety:
 * ─────────────
 * CDK manages the full lifecycle: on close it detaches the overlay,
 * destroys the container, and disposes the overlay ref.
 * Our DialogRef subjects complete via CDK's `closed` observable,
 * preventing lingering subscriptions.
 */

import {
  inject,
  Injectable,
  Type,
} from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { filter } from 'rxjs';

import { DialogConfig, DEFAULT_DIALOG_CONFIG } from './dialog-config';
import { DialogRef } from './dialog-ref';
import { DialogContainerComponent } from './dialog-container';
import { DIALOG_GLOBAL_CONFIG, INTERNAL_DIALOG_CONFIG } from './dialog.tokens';

@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly _cdkDialog = inject(Dialog);
  private readonly _overlay = inject(Overlay);
  private readonly _globalConfig: DialogConfig | null =
    inject(DIALOG_GLOBAL_CONFIG, { optional: true });

  /** Stack of currently open dialog refs (most recent = last). */
  private readonly _openDialogRefs: DialogRef<any, any>[] = [];

  // ════════════════════════════════════════════════════════════════════
  //  Public API
  // ════════════════════════════════════════════════════════════════════

  /**
   * Open a dialog containing the given component.
   *
   * @param component  The component class to render inside the dialog.
   * @param config     Optional per-dialog configuration (merged on top
   *                   of global and default settings).
   * @returns          A strongly-typed `DialogRef` to interact with.
   *
   * @example
   * ```ts
   * const ref = this.dialog.open(UserFormComponent, {
   *   width: '500px',
   *   data: { userId: 10 },
   * });
   * ref.afterClosed().subscribe(result => console.log(result));
   * ```
   */
  open<T, D = unknown, R = unknown>(
    component: Type<T>,
    config?: DialogConfig<D>,
  ): DialogRef<T, R> {
    // ── 1. Merge configs: DEFAULT ← GLOBAL ← per-call ──────────────
    const mergedConfig = {
      ...DEFAULT_DIALOG_CONFIG,
      ...(this._globalConfig ?? {}),
      ...(config ?? {}),
    } as DialogConfig<D>;

    // ── 2. Prepare the return ref (set inside providers callback) ───
    let ourRef!: DialogRef<T, R>;

    // ── 3. Build CDK-native config ──────────────────────────────────
    const cdkConfig = {
      // Identity
      id: mergedConfig.id,

      // Sizing (applied on .cdk-overlay-pane)
      width: mergedConfig.width,
      height: mergedConfig.height,
      minWidth: mergedConfig.minWidth,
      minHeight: mergedConfig.minHeight,
      maxWidth: mergedConfig.maxWidth ?? '90vw',
      maxHeight: mergedConfig.maxHeight ?? '90vh',

      // Backdrop
      hasBackdrop: mergedConfig.hasBackdrop !== false,
      backdropClass: mergedConfig.backdropClass || 'cdk-overlay-dark-backdrop',

      // Panel class (always include our base class)
      panelClass: this._buildPanelClasses(mergedConfig),

      // Data (CDK provides this as DIALOG_DATA automatically)
      data: mergedConfig.data,

      // We manage close ourselves for fine-grained closeOnBackdrop / closeOnEsc.
      disableClose: true,

      // Accessibility
      autoFocus: mergedConfig.autoFocus ?? true,
      restoreFocus: mergedConfig.restoreFocus ?? true,
      role: mergedConfig.role ?? 'dialog',
      ariaLabel: mergedConfig.ariaLabel ?? null,
      ariaLabelledBy: mergedConfig.ariaLabelledBy ?? null,
      ariaDescribedBy: mergedConfig.ariaDescribedBy ?? null,

      // Scroll strategy
      scrollStrategy:
        mergedConfig.scrollStrategy ??
        (mergedConfig.lockScroll !== false
          ? this._overlay.scrollStrategies.block()
          : this._overlay.scrollStrategies.noop()),

      // Position strategy (centered by default, shifted by offsets)
      positionStrategy: this._buildPositionStrategy(mergedConfig),

      // ── Custom container ──────────────────────────────────────────
      container: {
        type: DialogContainerComponent,
        providers: () => [
          { provide: INTERNAL_DIALOG_CONFIG, useValue: mergedConfig },
        ],
      },

      // ── Provider callback ─────────────────────────────────────────
      // Runs after the container is created but before the user
      // component.  We create our `DialogRef` wrapper here and make
      // it available for injection in the user component.
      providers: (
        cdkRef: any,
        _cdkConfig: any,
        containerInstance: any,
      ) => {
        ourRef = new DialogRef<T, R>(cdkRef);
        ourRef._containerInstance = containerInstance as DialogContainerComponent;

        // Wire up afterOpened emission.
        (containerInstance as DialogContainerComponent).opened
          .then(() => ourRef._emitOpened());

        return [
          { provide: DialogRef, useValue: ourRef },
        ];
      },
    };

    // ── 4. Open via CDK ─────────────────────────────────────────────
    const cdkRef = this._cdkDialog.open(component, cdkConfig as any);

    // ── 5. Link componentInstance ───────────────────────────────────
    ourRef.componentInstance = cdkRef.componentInstance as T;

    // ── 6. Set up close-on-backdrop / close-on-ESC ──────────────────
    this._setupCloseListeners(ourRef, mergedConfig);

    // ── 7. Track in stack ───────────────────────────────────────────
    this._openDialogRefs.push(ourRef);

    // ── 8. Cleanup on close ─────────────────────────────────────────
    ourRef.afterClosed().subscribe(() => {
      const idx = this._openDialogRefs.indexOf(ourRef);
      if (idx !== -1) this._openDialogRefs.splice(idx, 1);
    });

    return ourRef;
  }

  /**
   * Close all currently open dialogs (most recent first).
   */
  closeAll(): void {
    for (let i = this._openDialogRefs.length - 1; i >= 0; i--) {
      this._openDialogRefs[i]!.close();
    }
  }

  /**
   * Returns the `DialogRef` of the most recently opened dialog,
   * or `undefined` if none are open.
   */
  getTopDialog(): DialogRef | undefined {
    return this._openDialogRefs[this._openDialogRefs.length - 1];
  }

  /**
   * Get a dialog by its CDK-managed unique ID.
   */
  getDialogById(id: string): DialogRef | undefined {
    return this._openDialogRefs.find(r => r.id === id);
  }

  /**
   * Number of currently open dialogs.
   */
  get openDialogCount(): number {
    return this._openDialogRefs.length;
  }

  /**
   * Read-only snapshot of currently open dialog refs.
   * Used internally by content directives (`BkDialogTitle`, `BkDialogActions`,
   * `BkDialogClose`) for the DOM-walk fallback when `DialogRef` is not
   * available via injection (e.g. inside `<ng-template>`).
   */
  get openDialogsRef(): readonly DialogRef[] {
    return this._openDialogRefs;
  }

  // ════════════════════════════════════════════════════════════════════
  //  Convenience Helpers
  // ════════════════════════════════════════════════════════════════════

  /**
   * Open a simple confirmation dialog.
   * Resolves `true` if the user confirms, `false` otherwise.
   *
   * @example
   * ```ts
   * const ref = this.dialog.confirm({
   *   message: 'Delete this item?',
   *   component: ConfirmDialogComponent,
   * });
   * ref.afterClosed().subscribe(yes => { if (yes) ... });
   * ```
   */
  confirm(options: {
    title?: string;
    message: string;
    btnOkText?: string;
    btnCancelText?: string;
    width?: string;
    component: Type<unknown>;
  }): DialogRef<unknown, boolean> {
    return this.open<unknown, unknown, boolean>(options.component, {
      width: options.width ?? '400px',
      disableClose: true,
      closeOnBackdrop: false,
      animation: 'fade',
      data: {
        title: options.title ?? 'Confirm',
        message: options.message,
        btnOkText: options.btnOkText ?? 'Yes',
        btnCancelText: options.btnCancelText ?? 'No',
      },
    });
  }

  /**
   * Open a simple alert dialog.
   */
  alert(options: {
    title?: string;
    message: string;
    btnOkText?: string;
    width?: string;
    component: Type<unknown>;
  }): DialogRef<unknown, void> {
    return this.open<unknown, unknown, void>(options.component, {
      width: options.width ?? '400px',
      disableClose: true,
      closeOnBackdrop: false,
      animation: 'fade',
      data: {
        title: options.title ?? 'Alert',
        message: options.message,
        btnOkText: options.btnOkText ?? 'OK',
      },
    });
  }

  // ════════════════════════════════════════════════════════════════════
  //  Private
  // ════════════════════════════════════════════════════════════════════

  /**
   * Subscribe to backdrop-click and ESC events on the CDK ref,
   * closing the dialog based on our config flags.
   *
   * We always set CDK `disableClose: true` so that CDK never auto-closes;
   * this gives us fine-grained control over `closeOnBackdrop` and
   * `closeOnEsc` independently.
   */
  private _setupCloseListeners(ref: DialogRef, config: DialogConfig): void {
    if (config.disableClose) return;

    // Backdrop click
    if (config.closeOnBackdrop !== false) {
      ref.backdropClick().subscribe(() => ref.close());
    }

    // ESC key
    if (config.closeOnEsc !== false) {
      ref.keydownEvents()
        .pipe(filter((e: KeyboardEvent) => e.key === 'Escape' || e.key === 'Esc'))
        .subscribe((e: KeyboardEvent) => {
          e.preventDefault();
          ref.close();
        });
    }
  }

  /**
   * Build the CSS classes for the CDK overlay pane.
   * Always includes our base class; adds user-provided classes on top.
   */
  private _buildPanelClasses(config: DialogConfig): string[] {
    const classes = ['bk-dialog-pane'];
    if (config.panelClass) {
      if (Array.isArray(config.panelClass)) {
        classes.push(...config.panelClass);
      } else {
        classes.push(config.panelClass);
      }
    }
    return classes;
  }

  /**
   * Build CDK's `GlobalPositionStrategy` from our position config.
   * Falls back to centred (both axes) when no position is specified.
   */
  private _buildPositionStrategy(config: DialogConfig) {
    const strategy = this._overlay.position().global();

    if (config.position?.top) {
      strategy.top(config.position.top);
    } else if (config.position?.bottom) {
      strategy.bottom(config.position.bottom);
    } else {
      strategy.centerVertically();
    }

    if (config.position?.left) {
      strategy.left(config.position.left);
    } else if (config.position?.right) {
      strategy.right(config.position.right);
    } else {
      strategy.centerHorizontally();
    }

    return strategy;
  }
}
