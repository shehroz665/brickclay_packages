import { Component, Input, Output, EventEmitter, forwardRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'brickclay-toggle',
  standalone: true,
  imports: [CommonModule],
  encapsulation:ViewEncapsulation.None,
  templateUrl: './toggle.html',
  styleUrls: ['./toggle.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleComponent),
      multi: true
    }
  ]
})
export class ToggleComponent implements ControlValueAccessor {

  @Input() label: string = '';
  @Input() disabled: boolean = false;
  @Input() toggleClass: string = 'toggle-md';

  @Output() change = new EventEmitter<boolean>();

  isChecked: boolean = false;

  // CVA callbacks (placeholders)
  onChange = (_: boolean) => {};
  onTouched = () => {};

  toggle() {
    if (this.disabled) return;

    this.isChecked = !this.isChecked;
    this.onChange(this.isChecked); // Notify Forms API
    this.onTouched();              // Notify Validation API
    this.change.emit(this.isChecked); // Notify standard event listeners
  }

  // Called by Angular to write value to the view
  writeValue(value: boolean): void {
    this.isChecked = value;
  }

  // Called by Angular to register the function to call when changed
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // Called by Angular to register the function to call when touched
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // Called by Angular when the disabled state changes
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
