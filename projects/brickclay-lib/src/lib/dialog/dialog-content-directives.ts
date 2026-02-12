/**
 * Dialog Content Directives
 *
 * Architecture Decision:
 * ─────────────────────
 * These directives mirror Angular Material's dialog content directives:
 *
 *   MatDialogTitle    → BkDialogTitle
 *   MatDialogContent  → BkDialogContent
 *   MatDialogActions  → BkDialogActions
 *   MatDialogClose    → BkDialogClose
 *
 * Each directive:
 *  1. Applies the corresponding CSS host class (e.g. `bk-dialog-content`)
 *     that is styled in `dialog-container.css` via `::ng-deep`.
 *  2. Provides extra accessibility or behavioural features on top of the
 *     plain CSS class.
 *
 * Consumers can still use the raw CSS classes directly (without importing
 * these directives) for backward compatibility, but the directives are
 * preferred because they add CdkScrollable, ARIA integration, and one-click
 * close behaviour.
 *
 * @see https://github.com/angular/components/blob/main/src/material/dialog/dialog-content-directives.ts
 */

import {
  Directive,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CdkScrollable } from '@angular/cdk/scrolling';

import { DialogRef } from './dialog-ref';
import { DialogService } from './dialog.service';

// ──── ID Generation ──────────────────────────────────────────────────────

let nextTitleId = 0;

// ──── Helper ─────────────────────────────────────────────────────────────

/**
 * Finds the closest `DialogRef` by walking up the DOM from the given
 * element to the nearest `bk-dialog-container` host, then matching its
 * `id` attribute against the currently open dialogs.
 *
 * This fallback is necessary when a directive lives inside an
 * `<ng-template>` (TemplateRef), where the dialog's custom injector is
 * not available.
 *
 * @see Material's `getClosestDialog` in `dialog-content-directives.ts`
 */
function getClosestDialog(
  element: ElementRef<HTMLElement>,
  openDialogs: readonly DialogRef[],
): DialogRef | null {
  let parent = element.nativeElement.parentElement;
  while (parent && !parent.classList.contains('bk-dialog-container')) {
    parent = parent.parentElement;
  }
  return parent
    ? openDialogs.find(ref => ref.id === parent!.id) ?? null
    : null;
}

// ──── Base for Title / Actions ───────────────────────────────────────────

/**
 * Shared abstract base that resolves the owning `DialogRef` (via DI or
 * DOM walk) and invokes `_onAdd()` / `_onRemove()` lifecycle hooks.
 *
 * Same pattern as Material's internal `MatDialogLayoutSection`.
 */
@Directive({ standalone: true })
abstract class BkDialogLayoutSection implements OnInit, OnDestroy {
  protected _dialogRef: DialogRef | null = inject(DialogRef, { optional: true });
  protected _elementRef = inject(ElementRef<HTMLElement>);
  private _dialogService = inject(DialogService);

  ngOnInit(): void {
    if (!this._dialogRef) {
      this._dialogRef = getClosestDialog(
        this._elementRef,
        this._dialogService.openDialogsRef,
      );
    }
    if (this._dialogRef) {
      Promise.resolve().then(() => this._onAdd());
    }
  }

  ngOnDestroy(): void {
    if (this._dialogRef) {
      Promise.resolve().then(() => this._onRemove());
    }
  }

  protected abstract _onAdd(): void;
  protected abstract _onRemove(): void;
}

// ════════════════════════════════════════════════════════════════════════
//  BkDialogTitle
// ════════════════════════════════════════════════════════════════════════

/**
 * Marks an element as the dialog title.
 *
 * • Generates a unique `id` and binds it to the host element.
 * • Registers the `id` with the CDK container's `aria-labelledby` queue
 *   so screen readers announce the dialog title automatically.
 *
 * Usage:
 * ```html
 * <h2 bk-dialog-title>Edit User</h2>
 * ```
 */
@Directive({
  selector: '[bk-dialog-title], [bkDialogTitle]',
  standalone: true,
  exportAs: 'bkDialogTitle',
  host: {
    'class': 'bk-dialog-title',
    '[id]': 'id',
  },
})
export class BkDialogTitle extends BkDialogLayoutSection {
  /** Unique element `id`. Auto-generated but can be overridden. */
  @Input() id: string = `bk-dialog-title-${nextTitleId++}`;

  protected _onAdd(): void {
    // Register with the CdkDialogContainer's aria-labelledby queue.
    // _containerInstance extends CdkDialogContainer which has _addAriaLabelledBy.
    (this._dialogRef as any)?._containerInstance?._addAriaLabelledBy?.(this.id);
  }

  protected _onRemove(): void {
    (this._dialogRef as any)?._containerInstance?._removeAriaLabelledBy?.(this.id);
  }
}

// ════════════════════════════════════════════════════════════════════════
//  BkDialogContent
// ════════════════════════════════════════════════════════════════════════

/**
 * Scrollable content area of a dialog.
 *
 * • Applies the `bk-dialog-content` CSS class → `flex: 1 1 auto; overflow: auto`.
 * • Composes CDK's `CdkScrollable` for scroll-position monitoring and
 *   integration with CDK's scroll dispatcher.
 *
 * Usage (attribute):
 * ```html
 * <div bk-dialog-content>
 *   <!-- body content — this area scrolls -->
 * </div>
 * ```
 *
 * Usage (element):
 * ```html
 * <bk-dialog-content>...</bk-dialog-content>
 * ```
 */
@Directive({
  selector: '[bk-dialog-content], bk-dialog-content, [bkDialogContent]',
  standalone: true,
  exportAs: 'bkDialogContent',
  host: {
    'class': 'bk-dialog-content',
  },
  hostDirectives: [CdkScrollable],
})
export class BkDialogContent {}

// ════════════════════════════════════════════════════════════════════════
//  BkDialogActions
// ════════════════════════════════════════════════════════════════════════

/**
 * Container for action buttons at the bottom of a dialog.
 * Stays pinned when the content area scrolls.
 *
 * • Applies `bk-dialog-actions` class → `flex: 0 0 auto` (never shrinks).
 * • Optional `align` input controls horizontal alignment.
 *
 * Usage:
 * ```html
 * <div bk-dialog-actions>
 *   <button (click)="cancel()">Cancel</button>
 *   <button (click)="save()">Save</button>
 * </div>
 *
 * <!-- With alignment -->
 * <div bk-dialog-actions align="center">...</div>
 * ```
 */
@Directive({
  selector: '[bk-dialog-actions], bk-dialog-actions, [bkDialogActions]',
  standalone: true,
  exportAs: 'bkDialogActions',
  host: {
    'class': 'bk-dialog-actions',
    '[class.bk-dialog-actions-align-start]': 'align === "start"',
    '[class.bk-dialog-actions-align-center]': 'align === "center"',
    '[class.bk-dialog-actions-align-end]': 'align === "end"',
  },
})
export class BkDialogActions extends BkDialogLayoutSection {
  /** Horizontal alignment of action buttons. */
  @Input() align?: 'start' | 'center' | 'end';

  protected _onAdd(): void {
    // Future: notify container for action section count (like Material).
  }

  protected _onRemove(): void {
    // No-op.
  }
}

// ════════════════════════════════════════════════════════════════════════
//  BkDialogClose
// ════════════════════════════════════════════════════════════════════════

/**
 * Closes the dialog when the host element is clicked.
 * Optionally returns a result value to the opener.
 *
 * • Sets `type="button"` by default to prevent accidental form submissions.
 * • Supports an optional `aria-label` for screen readers.
 *
 * Usage:
 * ```html
 * <!-- Close with no result -->
 * <button bk-dialog-close>Cancel</button>
 *
 * <!-- Close with a result value -->
 * <button [bk-dialog-close]="'confirmed'">OK</button>
 *
 * <!-- Alternative camelCase binding -->
 * <button [bkDialogClose]="myResult">Done</button>
 * ```
 */
@Directive({
  selector: '[bk-dialog-close], [bkDialogClose]',
  standalone: true,
  exportAs: 'bkDialogClose',
  host: {
    '(click)': '_onButtonClick($event)',
    '[attr.aria-label]': 'ariaLabel || null',
    '[attr.type]': 'type',
  },
})
export class BkDialogClose implements OnInit, OnChanges {
  private _dialogRef: DialogRef | null = inject(DialogRef, { optional: true });
  private _elementRef = inject(ElementRef<HTMLElement>);
  private _dialogService = inject(DialogService);

  /** Screen-reader label for the button. */
  @Input('aria-label') ariaLabel?: string;

  /** Prevents accidental form submits. Default: `'button'`. */
  @Input() type: 'submit' | 'button' | 'reset' = 'button';

  /** Dialog result — set via `[bk-dialog-close]="value"`. */
  @Input('bk-dialog-close') dialogResult: any;

  /** Alternative camelCase binding: `[bkDialogClose]="value"`. */
  @Input('bkDialogClose') _bkDialogClose: any;

  ngOnInit(): void {
    if (!this._dialogRef) {
      this._dialogRef = getClosestDialog(
        this._elementRef,
        this._dialogService.openDialogsRef,
      );
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const proxiedChange = changes['_bkDialogClose'] || changes['dialogResult'];
    if (proxiedChange) {
      this.dialogResult = proxiedChange.currentValue;
    }
  }

  _onButtonClick(_event: MouseEvent): void {
    this._dialogRef?.close(this.dialogResult);
  }
}
