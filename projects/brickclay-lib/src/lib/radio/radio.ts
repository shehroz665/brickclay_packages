import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'bk-radio-button',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './radio.html',
  styleUrl: './radio.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BkRadioButton),
      multi: true,
    },
  ],
})
export class BkRadioButton implements ControlValueAccessor {

  @Input() radioClass = '';
  @Input() label = '';
  @Input() labelClass = '';
  /**
   * The model value represented by this radio option.
   * Checked when the bound model `=== value`.
   */
  @Input() value: unknown;
  /**
   * Model value to write when de-selecting this radio (only when `allowDeselect` is true).
   */
  @Input() uncheckedValue: unknown = null;
  /**
   * If true, selecting an already-selected radio will clear the model to `uncheckedValue`.
   * Default false (standard radio behavior).
   */
  @Input() allowDeselect = false;
  @Input() disabled = false;
  @Input() variant: 'dot' | 'tick' = 'dot';

  @Output() change = new EventEmitter<unknown>();

  modelValue: unknown;

  onChange = (_: unknown) => {};
  onTouched = () => {};

  select(): void {
    if (this.disabled) return;

    if (this.modelValue === this.value) {
      if (!this.allowDeselect) return;
      this.modelValue = this.uncheckedValue;
      this.onChange(this.uncheckedValue);
      this.onTouched();
      this.change.emit(this.uncheckedValue);
      return;
    }

    this.modelValue = this.value;
    this.onChange(this.value);
    this.onTouched();
    this.change.emit(this.value);
  }

  get isChecked(): boolean {
    return this.modelValue === this.value;
  }

  writeValue(value: unknown): void {
    this.modelValue = value;
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
