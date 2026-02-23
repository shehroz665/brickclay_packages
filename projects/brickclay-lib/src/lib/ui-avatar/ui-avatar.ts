import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BKTooltipDirective } from '../tooltip/tooltip.directive';


export type AvatarSize = 'xsm' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type AvatarVariant = 'gray' | 'colored';
export type DotStatus = 'active' | 'inactive' | 'notification' | 'none';
export type DotPosition = 'bottom-right' | 'top-left';
export type AvatarFallback = 'auto' | 'initials' | 'icon';

@Component({
  selector: 'bk-avatar',
  standalone: true,
  imports: [CommonModule, BKTooltipDirective],
  templateUrl: './ui-avatar.html',
  styleUrls: ['./ui-avatar.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BkAvatar),
      multi: true
    }
  ]
})
export class BkAvatar implements OnChanges, ControlValueAccessor {

  constructor(private cdr: ChangeDetectorRef) {}

  // ---------- Display Inputs ----------
  @Input() src: string | null = null;
  @Input() alt = 'Avatar';
  @Input() name = '';

  @Input() size: AvatarSize = 'md';
  @Input() variant: AvatarVariant = 'gray';
  @Input() fallback: AvatarFallback = 'auto';

  @Input() dot: DotStatus = 'none';
  @Input() dotPosition: DotPosition = 'bottom-right';

  // ---------- Outputs ----------
  /** Emits when the provided image URL fails to load */
  @Output() imageLoadError = new EventEmitter<void>();

  // ---------- Internal State ----------
  initials = '';
  imageLoadFailed = false;

  // ---------- CVA Callbacks ----------
  private onChange = (_value: string | null) => {};
  private onTouched = () => {};

  /**
   * Called by the forms system when the model value changes (ngModel / formControl).
   * Sets the src directly and tells OnPush to re-check the template.
   */
  writeValue(value: string | null): void {
    this.src = value || null;
    this.imageLoadFailed = false;
    // OnPush won't detect this change on its own because writeValue
    // is called programmatically by the forms system — not through an
    // @Input binding. markForCheck tells Angular: "this component's
    // template might have changed, check it on the next CD cycle."
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(_isDisabled: boolean): void {
    // Display-only component — disabled doesn't change visual behaviour,
    // but we still honour the CVA contract.
    this.cdr.markForCheck();
  }

  // ---------- Lifecycle ----------
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['name']) {
      this.initials = this.getInitials(this.name);
    }
    // Reset error state whenever a new src arrives via @Input
    if (changes['src']) {
      this.imageLoadFailed = false;
    }
  }

  onImageError(): void {
    this.imageLoadFailed = true;
    this.imageLoadError.emit();
  }

  // ---------- Derived UI ----------
  get showImage(): boolean {
    return !!(this.src) && !this.imageLoadFailed;
  }

  get showInitials(): boolean {
    if (this.showImage) return false;
    if (!this.name) return false;
    if (this.fallback === 'icon') return false;
    return true; // 'auto' and 'initials' both show initials when name is present
  }

  get showIcon(): boolean {
    return !this.showImage && !this.showInitials;
  }

  get containerClasses(): string {
    return [
      'avatar',
      this.size,
      VARIANT_MAP[this.variant]
    ].join(' ');
  }

  get dotClasses(): string {
    return [
      'avatar-dot',
      this.size,
      DOT_COLOR_MAP[this.dot],
      DOT_POSITION_MAP[this.dotPosition]
    ].join(' ');
  }

  // ---------- Utils ----------
  private getInitials(name: string): string {
    if (!name?.trim()) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts.at(-1)![0]).toUpperCase();
  }
}

// ---------- Constants ----------
const VARIANT_MAP: Record<AvatarVariant, string> = {
  gray: 'bg-white border border-[#EFEFF1] text-[#363C51]',
  colored: 'bg-[#F63D68] border border-white text-white'
};

const DOT_COLOR_MAP: Record<DotStatus, string> = {
  active: 'active',
  inactive: 'inactive',
  notification: 'notification',
  none: 'hidden'
};

const DOT_POSITION_MAP: Record<DotPosition, string> = {
  'bottom-right': 'bottom-0 right-0',
  'top-left': 'top-0.5 -left-0.5'
};
