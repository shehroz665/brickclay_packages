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
 * import { BkDialogService, BkDialogRef, BK_DIALOG_DATA, BkDialogContent } from '@shared/components/dialog';
 * ```
 */

// ── Module (convenience wrapper — like MatDialogModule) ─────────────
export { BkDialogModule } from './dialog.module';

// ── Config ──────────────────────────────────────────────────────────
export type { BkDialogConfig, BkDialogPosition, BkDialogAnimation } from './dialog-config';
export { BK_DEFAULT_DIALOG_CONFIG } from './dialog-config';

// ── Reference handle ────────────────────────────────────────────────
export { BkDialogRef } from './dialog-ref';

// ── Tokens ──────────────────────────────────────────────────────────
export { BK_DIALOG_DATA, BK_DIALOG_GLOBAL_CONFIG } from './dialog.tokens';

// ── Container (rarely needed directly, exported for advanced usage) ─
export { BkDialogContainerComponent } from './dialog-container';

// ── Service ─────────────────────────────────────────────────────────
export { BkDialogService } from './dialog.service';

// ── Content directives (standalone — usable with or without module) ─
export {
  BkDialogTitle,
  BkDialogContent,
  BkDialogActions,
  BkDialogClose,
} from './dialog-content-directives';

// ── Animations (for custom container builders) ──────────────────────
export type { BkAnimationKeyframes } from './dialog-animations';
export { getDialogPanelAnimation, getDialogBackdropAnimation } from './dialog-animations';
