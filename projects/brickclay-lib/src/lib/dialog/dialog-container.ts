/**
 * DialogContainerComponent
 *
 * Architecture Decision:
 * ─────────────────────
 * Extends CDK's `CdkDialogContainer` — the headless base class that
 * provides:
 *   • Focus-trap management (tab key stays inside the dialog).
 *   • Auto-focus / restore-focus behaviour.
 *   • Portal outlet (`<ng-template cdkPortalOutlet />`) for dynamic
 *     component projection.
 *   • ARIA attribute management on the host element.
 *
 * We add:
 *   • WAAPI enter / leave animations on the panel (host element) and
 *     the CDK backdrop sibling.
 *   • Flex-column styles on the dynamically created component host so
 *     `.bk-dialog-content` scrolls and `.bk-dialog-actions` stays pinned.
 *   • Position-offset application via CSS margin.
 *
 * This component is **never** used directly — it is created internally
 * by `DialogService` via CDK's `Dialog.open()`.
 */

import {
  Component,
  ComponentRef,
  inject,
  OnInit,
} from '@angular/core';
import { CdkDialogContainer } from '@angular/cdk/dialog';
import { CdkPortalOutlet, ComponentPortal } from '@angular/cdk/portal';

import { DialogConfig } from './dialog-config';
import { INTERNAL_DIALOG_CONFIG } from './dialog.tokens';
import {
  getDialogPanelAnimation,
  getDialogBackdropAnimation,
} from './dialog-animations';

@Component({
  selector: 'bk-dialog-container',
  standalone: true,
  imports: [CdkPortalOutlet],
  templateUrl: './dialog-container.html',
  styleUrl: './dialog-container.css',
  host: {
    'class': 'bk-dialog-container',
  },
})
export class DialogContainerComponent extends CdkDialogContainer implements OnInit {

  /**
   * Our full config (including animation fields).
   * Provided by DialogService via the INTERNAL_DIALOG_CONFIG token.
   */
  private readonly _dialogConfig: DialogConfig = inject(INTERNAL_DIALOG_CONFIG);

  // ──── Opened promise ─────────────────────────────────────────────────
  /**
   * Resolves when the enter animation finishes (or immediately for 'none').
   * `DialogService` subscribes via `.then()` to emit `afterOpened` on the
   * `DialogRef`.
   */
  private _resolveOpened!: () => void;
  readonly opened = new Promise<void>(resolve => {
    this._resolveOpened = resolve;
  });

  // ──── Lifecycle ──────────────────────────────────────────────────────

  ngOnInit(): void {
    this._playEnterAnimation();
    this._applyPositionOffsets();
  }

  // ──── Portal override ────────────────────────────────────────────────

  /**
   * Override the CDK base to apply flex-column layout on the dynamically
   * created component's host element.
   *
   * Angular's emulated view encapsulation prevents scoped CSS from reaching
   * dynamically-projected elements, so we set styles programmatically.
   */
  override attachComponentPortal<C>(portal: ComponentPortal<C>): ComponentRef<C> {
    const ref = super.attachComponentPortal(portal);
    const el = ref.location.nativeElement as HTMLElement;
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.flex = '1 1 auto';
    el.style.minHeight = '0';
    el.style.overflow = 'hidden';
    return ref;
  }

  // ──── WAAPI Animations ───────────────────────────────────────────────

  /**
   * Play the enter animation on the panel (host element) and backdrop.
   * Resolves the `opened` promise when the panel animation finishes.
   */
  private _playEnterAnimation(): void {
    const preset = this._dialogConfig.animation ?? 'fade';

    if (preset === 'none') {
      this._resolveOpened();
      return;
    }

    const enterDur = this._dialogConfig.animationDurationEnter ?? 200;
    const leaveDur = this._dialogConfig.animationDurationLeave ?? 150;

    // ── Panel animation ──
    const panelAnim = getDialogPanelAnimation(preset, enterDur, leaveDur);
    const anim = this._elementRef.nativeElement.animate(
      panelAnim.enter.keyframes,
      panelAnim.enter.options,
    );

    // ── Backdrop animation ──
    const backdropEl = this._getBackdropElement();
    if (backdropEl) {
      // Override CDK's CSS transition so our WAAPI timing wins.
      backdropEl.style.transition = 'none';
      backdropEl.style.backgroundColor = 'var(--dialog-backdrop-bg, rgba(0, 0, 0, 0.5))';
      const bdAnim = getDialogBackdropAnimation(enterDur, leaveDur);
      backdropEl.animate(bdAnim.enter.keyframes, bdAnim.enter.options);
    }

    anim.onfinish = () => this._resolveOpened();
  }

  /**
   * Play the leave animation.  Returns a Promise that resolves when done.
   * Called by `DialogRef._runCloseSequence()` before CDK tears down the
   * overlay.
   */
  playLeaveAnimation(): Promise<void> {
    const preset = this._dialogConfig.animation ?? 'fade';
    if (preset === 'none') return Promise.resolve();

    const enterDur = this._dialogConfig.animationDurationEnter ?? 200;
    const leaveDur = this._dialogConfig.animationDurationLeave ?? 150;

    return new Promise<void>(resolve => {
      // ── Panel ──
      const panelAnim = getDialogPanelAnimation(preset, enterDur, leaveDur);
      const anim = this._elementRef.nativeElement.animate(
        panelAnim.leave.keyframes,
        panelAnim.leave.options,
      );

      // ── Backdrop ──
      const backdropEl = this._getBackdropElement();
      if (backdropEl) {
        const bdAnim = getDialogBackdropAnimation(enterDur, leaveDur);
        backdropEl.animate(bdAnim.leave.keyframes, bdAnim.leave.options);
      }

      anim.onfinish = () => resolve();
      // Safety net — resolve even if onfinish never fires (SSR, etc.).
      setTimeout(() => resolve(), leaveDur + 50);
    });
  }

  // ──── Position Offsets ───────────────────────────────────────────────

  /**
   * Apply explicit position offsets via CSS margin.
   * These are additive to CDK's `GlobalPositionStrategy` alignment.
   */
  private _applyPositionOffsets(): void {
    const pos = this._dialogConfig.position;
    if (!pos) return;

    const el = this._elementRef.nativeElement;
    if (pos.top) el.style.marginTop = pos.top;
    if (pos.bottom) el.style.marginBottom = pos.bottom;
    if (pos.left) el.style.marginLeft = pos.left;
    if (pos.right) el.style.marginRight = pos.right;
  }

  // ──── Helpers ────────────────────────────────────────────────────────

  /**
   * CDK places the backdrop as a sibling of `.cdk-overlay-pane`.
   * Walk up from our host → pane → wrapper, then query for the backdrop.
   */
  private _getBackdropElement(): HTMLElement | null {
    const pane = this._elementRef.nativeElement.closest('.cdk-overlay-pane');
    return pane?.parentElement?.querySelector<HTMLElement>('.cdk-overlay-backdrop') ?? null;
  }
}
