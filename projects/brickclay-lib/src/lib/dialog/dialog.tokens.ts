/**
 * Dialog Injection Tokens
 *
 * Architecture Decision:
 * ─────────────────────
 * • `DIALOG_DATA` — Re-exported from `@angular/cdk/dialog` so that
 *   consumers import from our barrel and the token identity matches
 *   exactly what CDK's `Dialog` service provides in the injector.
 *   This means `@Inject(DIALOG_DATA)` works without any extra wiring.
 *
 * • `DIALOG_GLOBAL_CONFIG` — Optional app-level defaults, same pattern
 *   as before.
 *
 * • `INTERNAL_DIALOG_CONFIG` — Internal-only token used to pass our
 *   full `DialogConfig` (including animation fields) to the custom
 *   `DialogContainerComponent`.  Not part of the public API.
 */

import { InjectionToken } from '@angular/core';
import { DIALOG_DATA as CDK_DIALOG_DATA } from '@angular/cdk/dialog';
import { DialogConfig } from './dialog-config';

// ──── Public ─────────────────────────────────────────────────────────────

/**
 * Injection token used to pass arbitrary data into a dialog component.
 *
 * This is CDK's own `DIALOG_DATA` token — re-exported so that imports
 * from our barrel (`shared/components/dialog`) resolve to the exact same
 * token that CDK's `Dialog` service provides.
 *
 * Usage inside a dialog component:
 * ```ts
 * constructor(@Inject(DIALOG_DATA) public data: MyDataType) {}
 * ```
 */
export const DIALOG_DATA = CDK_DIALOG_DATA;

/**
 * Optional token for providing global dialog defaults at the
 * application level.
 *
 * Usage in `app.config.ts` or a module's `providers` array:
 * ```ts
 * providers: [
 *   { provide: DIALOG_GLOBAL_CONFIG, useValue: { animation: 'zoom', width: '600px' } }
 * ]
 * ```
 */
export const DIALOG_GLOBAL_CONFIG = new InjectionToken<DialogConfig>(
  'DIALOG_GLOBAL_CONFIG',
);

// ──── Internal ───────────────────────────────────────────────────────────

/**
 * Internal token that carries our full `DialogConfig` (with animation
 * settings, position offsets, etc.) into the `DialogContainerComponent`.
 *
 * @internal — not exported from the barrel; do not depend on it.
 */
export const INTERNAL_DIALOG_CONFIG = new InjectionToken<DialogConfig>(
  'INTERNAL_DIALOG_CONFIG',
);
