/**
 * Dialog — Public API Barrel Export
 *
 * Import everything from this single entry point:
 *
 * ```ts
 * // Module-based (NgModule) — single import, all directives available
 * import { BkDialogModule } from '@shared/components/dialog';
 *
 * // Standalone / cherry-pick
 * import { DialogService, DialogRef, DIALOG_DATA, BkDialogContent } from '@shared/components/dialog';
 * ```
 */

// ── Module (convenience wrapper — like MatDialogModule) ─────────────
export { BkDialogModule } from './dialog.module';

// ── Config ──────────────────────────────────────────────────────────
export type { DialogConfig, DialogPosition, DialogAnimation } from './dialog-config';
export { DEFAULT_DIALOG_CONFIG } from './dialog-config';

// ── Reference handle ────────────────────────────────────────────────
export { DialogRef } from './dialog-ref';

// ── Tokens ──────────────────────────────────────────────────────────
export { DIALOG_DATA, DIALOG_GLOBAL_CONFIG } from './dialog.tokens';

// ── Container (rarely needed directly, exported for advanced usage) ─
export { DialogContainerComponent } from './dialog-container';

// ── Service ─────────────────────────────────────────────────────────
export { DialogService } from './dialog.service';

// ── Content directives (standalone — usable with or without module) ─
export {
  BkDialogTitle,
  BkDialogContent,
  BkDialogActions,
  BkDialogClose,
} from './dialog-content-directives';

// ── Animations (for custom container builders) ──────────────────────
export type { AnimationKeyframes } from './dialog-animations';
export { getDialogPanelAnimation, getDialogBackdropAnimation } from './dialog-animations';
