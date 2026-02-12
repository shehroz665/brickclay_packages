/**
 * Dialog Configuration
 *
 * Architecture Decision:
 * ─────────────────────
 * Our `DialogConfig` mirrors the fields from CDK's `DialogConfig` that we
 * expose, plus adds custom animation properties powered by WAAPI.
 *
 * When `DialogService.open()` is called these values are:
 *  1. Merged with global defaults and per-call overrides.
 *  2. Mapped onto CDK's native `DialogConfig` for overlay, backdrop, scroll,
 *     position, ARIA, and focus-trap management.
 *  3. Passed to `DialogContainerComponent` via an internal token for
 *     animation playback and position offsets.
 *
 * CDK handles: unique IDs, z-index stacking, scroll blocking, focus trap,
 * backdrop rendering, overlay positioning, keyboard events.
 * We handle: WAAPI animations, panel appearance, convenience config sugar.
 */

import { ScrollStrategy } from '@angular/cdk/overlay';

// ──── Animation Types ────────────────────────────────────────────────────

/**
 * Built-in WAAPI animation presets.
 * 'none' disables animation entirely.
 */
export type DialogAnimation =
  | 'none'
  | 'fade'
  | 'zoom'
  | 'slide-top'
  | 'slide-bottom'
  | 'slide-left'
  | 'slide-right';

// ──── Position ───────────────────────────────────────────────────────────

/**
 * Fine-grained position offsets.
 * When provided, the dialog shifts from the default centred position.
 * Internally this is mapped to CDK's `GlobalPositionStrategy`.
 */
export interface DialogPosition {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
}

// ──── Main Config ────────────────────────────────────────────────────────

export interface DialogConfig<D = unknown> {
  // ── Identity ──────────────────────────────────────────────────────────
  /**
   * Unique dialog identifier.
   * CDK auto-generates one if omitted and validates uniqueness —
   * opening a second dialog with the same ID throws at runtime.
   */
  id?: string;

  // ── Sizing ────────────────────────────────────────────────────────────
  width?: string;
  height?: string;
  minWidth?: string | number;
  minHeight?: string | number;
  maxWidth?: string | number;
  maxHeight?: string | number;

  // ── Behaviour ─────────────────────────────────────────────────────────
  /**
   * Master lock — when `true`, neither ESC nor backdrop click closes
   * the dialog (same semantics as `MatDialogConfig.disableClose`).
   */
  disableClose?: boolean;

  /**
   * Close when backdrop is clicked.  Default `true`.
   * Ignored when `disableClose` is `true`.
   */
  closeOnBackdrop?: boolean;

  /**
   * Close when Escape key is pressed.  Default `true`.
   * Ignored when `disableClose` is `true`.
   */
  closeOnEsc?: boolean;

  /** Show a backdrop behind the dialog.  Default `true`. */
  hasBackdrop?: boolean;

  /**
   * Block body scroll while the dialog is open.  Default `true`.
   * Mapped to CDK `BlockScrollStrategy` / `NoopScrollStrategy`.
   */
  lockScroll?: boolean;

  // ── Styling ───────────────────────────────────────────────────────────
  /** Extra CSS class(es) applied to the CDK overlay pane. */
  panelClass?: string | string[];
  /** Extra CSS class(es) applied to the CDK backdrop element. */
  backdropClass?: string | string[];

  // ── Data ──────────────────────────────────────────────────────────────
  /** Payload injected into the dialog component via `DIALOG_DATA`. */
  data?: D;

  // ── Animation (WAAPI) ─────────────────────────────────────────────────
  /** Panel animation preset.  Default `'fade'`. */
  animation?: DialogAnimation;
  /** Enter animation duration in ms.  Default `200`. */
  animationDurationEnter?: number;
  /** Leave animation duration in ms.  Default `150`. */
  animationDurationLeave?: number;

  // ── Position ──────────────────────────────────────────────────────────
  /** Position offsets — moves the dialog from its default centred position. */
  position?: DialogPosition;

  // ── Accessibility ─────────────────────────────────────────────────────
  role?: 'dialog' | 'alertdialog';
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  /**
   * Where to send focus when the dialog opens.
   * `true`  → first tabbable element (default).
   * `false` → no auto-focus.
   * A CSS selector string → that element.
   */
  autoFocus?: boolean | string;
  /** Restore focus to the previously-focused element on close. */
  restoreFocus?: boolean;

  // ── Advanced ──────────────────────────────────────────────────────────
  /** Override CDK's scroll strategy for this dialog. */
  scrollStrategy?: ScrollStrategy;
}

// ──── Defaults ───────────────────────────────────────────────────────────

export const DEFAULT_DIALOG_CONFIG: DialogConfig = {
  id: undefined,
  width: undefined,
  height: undefined,
  minWidth: undefined,
  minHeight: undefined,
  maxWidth: '90vw',
  maxHeight: '90vh',
  disableClose: false,
  closeOnBackdrop: true,
  closeOnEsc: true,
  hasBackdrop: true,
  lockScroll: true,
  panelClass: '',
  backdropClass: '',
  data: undefined,
  animation: 'fade',
  animationDurationEnter: 200,
  animationDurationLeave: 150,
  position: undefined,
  role: 'dialog',
  ariaLabel: undefined,
  ariaLabelledBy: undefined,
  ariaDescribedBy: undefined,
  autoFocus: true,
  restoreFocus: true,
  scrollStrategy: undefined,
};
