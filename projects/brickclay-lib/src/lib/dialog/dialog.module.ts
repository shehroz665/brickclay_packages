/**
 * BkDialogModule
 *
 * Optional NgModule wrapper for projects that prefer module-based usage.
 *
 * Architecture Decision:
 * ─────────────────────
 * Follows the exact same pattern as Angular Material's `MatDialogModule`
 * and `@brickclay-org/ui`'s `CalendarModule`:
 *
 *  • All components/directives are **standalone**.
 *  • This module simply imports + re-exports them for convenience.
 *  • `DialogService` is `providedIn: 'root'`, so it does NOT need to
 *    be listed in `providers` here — it is tree-shakeable and available
 *    app-wide automatically.
 *
 * Two usage styles:
 *
 * ───────── Module-based (NgModule) ─────────
 * ```ts
 * import { BkDialogModule } from '@shared/components/dialog';
 *
 * @NgModule({ imports: [BkDialogModule] })
 * export class FuelCostModule {}
 * ```
 *
 * ───────── Standalone ──────────────────────
 * ```ts
 * @Component({
 *   standalone: true,
 *   imports: [BkDialogContent, BkDialogActions, BkDialogClose],
 * })
 * export class MyDialog {}
 * ```
 *
 * @see https://github.com/angular/components/blob/main/src/material/dialog/dialog-module.ts
 */

import { NgModule } from '@angular/core';
import { DialogModule as CdkDialogModule } from '@angular/cdk/dialog';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';

import { DialogContainerComponent } from './dialog-container';
import {
  BkDialogTitle,
  BkDialogContent,
  BkDialogActions,
  BkDialogClose,
} from './dialog-content-directives';

@NgModule({
  imports: [
    // ── CDK foundations ──────────────────────────────────────────────
    CdkDialogModule,
    OverlayModule,
    PortalModule,

    // ── Our standalone pieces ───────────────────────────────────────
    DialogContainerComponent,
    BkDialogTitle,
    BkDialogContent,
    BkDialogActions,
    BkDialogClose,
  ],
  exports: [
    // ── Public API for template usage ───────────────────────────────
    // Consumers import BkDialogModule and get these directives in
    // their templates automatically — just like MatDialogModule.
    BkDialogTitle,
    BkDialogContent,
    BkDialogActions,
    BkDialogClose,
  ],
})
export class BkDialogModule {}
