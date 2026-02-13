import { Component, EventEmitter, Input, OnDestroy, Output, SimpleChanges, forwardRef } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BKTooltipDirective } from '../tooltip/tooltip.directive';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type AvatarFallback = 'auto' | 'initials' | 'icon' | 'camera';

@Component({
  selector: 'bk-avatar-profile',
  imports: [NgClass, CommonModule, BKTooltipDirective],
  templateUrl: './avatar-profile.html',
  styleUrl: './avatar-profile.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AvatarProfile),
      multi: true
    }
  ]
})
export class AvatarProfile implements OnDestroy, ControlValueAccessor {

  // ---------- Display inputs ----------
  @Input() src: string | null = null;
  @Input() alt = 'Avatar';
  @Input() name = '';
  @Input() size: AvatarSize = 'md';
  @Input() fallback: AvatarFallback = 'auto';

  // ---------- Functional inputs ----------
  /** Whether upload / remove actions are enabled */
  @Input() editable = true;
  /** Accepted file MIME types for the file picker */
  @Input() accept = 'image/jpeg, image/png';
  /** Max file size in KB (0 = no limit) */
  @Input() maxFileSizeKB = 0;
  /** Label shown on the upload button */
  @Input() uploadLabel = 'Upload';
  /** Hint text shown below the upload button */
  @Input() hint = '500x500 JPEG, PNG Image';
  /** External loading state (e.g. while uploading) */
  @Input() loading = false;
  /** Whether the remove badge is shown when an image is present */
  @Input() removable = false;

  // ---------- Form / CVA inputs ----------
  /** Label displayed above the avatar */
  @Input() label = '';
  /** Whether the field is required (shows asterisk) */
  @Input() required = false;
  /** External error state flag */
  @Input() hasError = false;
  /** Error message to display when hasError is true */
  @Input() errorMessage = '';
  /** Disabled state (also set via CVA setDisabledState) */
  @Input() disabled = false;

  // ---------- Outputs ----------
  /** Emits the selected File after validation passes */
  @Output() fileSelected = new EventEmitter();
  /** Emits when the user clicks the remove badge */
  @Output() removed = new EventEmitter<void>();
  /** Emits a human-readable error string on validation failure */
  @Output() fileError = new EventEmitter<string>();

  initials = '';
  imageLoadFailed = false;

  /** Local blob URL for instant preview before server upload completes */
  private previewUrl: string | null = null;

  // ---------- CVA Callbacks ----------
  private onChange = (_value: string | null) => {};
  private onTouched = () => {};

  writeValue(value: string | null): void {
    this.src = value || null;
    // When a new value arrives from the form (e.g. server URL after upload),
    // discard any stale local blob preview so displaySrc uses the real URL
    this.revokePreview();
    this.imageLoadFailed = false;
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.editable = !isDisabled;
  }

  // ---------- Lifecycle ----------
  ngOnChanges(changes: SimpleChanges): void {
    if (this.name) {
      this.initials = this.getInitials(this.name);
    }
    this.imageLoadFailed = false;

    // When the parent updates [src] via @Input (non-CVA usage), discard the local preview
    if (changes['src'] && this.previewUrl) {
      this.revokePreview();
    }
  }

  ngOnDestroy(): void {
    this.revokePreview();
  }

  onImageError(): void {
    this.imageLoadFailed = true;
  }

  // ---------- Derived UI ----------
  /** The URL the template should display — local preview takes priority over the server src */
  get displaySrc(): string | null {
    return this.previewUrl ?? this.src;
  }

  get showInitials(): boolean {
    if (!this.name) return false;
    if (this.fallback === 'icon') return false;
    if (this.fallback === 'camera') return false;
    if (this.fallback === 'initials') return true;
    return true; // auto
  }

  get containerClasses(): string {
    return ['avatar-profile', this.size].join(' ');
  }

  get sizeClasses(): AvatarSize[] {
    return [this.size];
  }

  get showRemoveButton(): boolean {
    return this.removable && this.editable && !!(this.displaySrc) && !this.imageLoadFailed;
  }

  // ---------- File handling ----------
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    // Validate file type
    if (this.accept && !this.isFileTypeValid(file)) {
      this.fileError.emit(`Invalid file type. Accepted: ${this.accept}`);
      input.value = '';
      return;
    }

    // Validate file size
    if (this.maxFileSizeKB > 0 && file.size > this.maxFileSizeKB * 1024) {
      this.fileError.emit(`File size exceeds ${this.maxFileSizeKB}KB limit.`);
      input.value = '';
      return;
    }

    // Instant local preview — no server round-trip needed to show the image
    this.revokePreview();
    this.previewUrl = URL.createObjectURL(file);
    this.imageLoadFailed = false;

    // Push the preview URL as the form value so validation (e.g. required) passes
    this.onChange(this.previewUrl);
    this.onTouched();

    this.fileSelected.emit(event);
    input.value = ''; // reset so re-selecting the same file still triggers change
  }

  onRemove(): void {
    this.revokePreview();
    this.src = null;
    this.onChange(null);
    this.onTouched();
    this.removed.emit();
  }

  // ---------- Utils ----------
  /** Revoke the previous object URL to free memory */
  private revokePreview(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }
  }

  private isFileTypeValid(file: File): boolean {
    const accepted = this.accept.split(',').map(t => t.trim());
    return accepted.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', '/'));
      }
      return file.type === type;
    });
  }

  private getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts.at(-1)![0]).toUpperCase();
  }
}
