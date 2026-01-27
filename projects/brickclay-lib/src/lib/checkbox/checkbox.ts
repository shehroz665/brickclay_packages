import { Component, Input, Output, EventEmitter, forwardRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'brickclay-checkbox',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './checkbox.html',
  styleUrls: ['./checkbox.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ]
})
export class CheckboxComponent implements ControlValueAccessor {

  @Input() checkboxClass: string = '';
  @Input() label: string = '';
  @Input() labelClass: string = '';
  @Input() disabled: boolean = false;

  @Output() change = new EventEmitter<boolean>();

  // This is the value bound via ngModel
  isChecked: boolean = false;

  // ControlValueAccessor callbacks
  private onChange = (_: any) => {};
  private onTouched = () => {};

  // Toggle function for click / keyboard
  toggle() {
    if (this.disabled) return;

    this.isChecked = !this.isChecked;

    // Update ngModel value
    this.onChange(this.isChecked);
    this.onTouched();

    // Emit the change event
    this.change.emit(this.isChecked);
  }

  /** ------------------ ControlValueAccessor methods ------------------ */

  writeValue(value: boolean): void {
    this.isChecked = value ?? false; // handle null/undefined safely
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
