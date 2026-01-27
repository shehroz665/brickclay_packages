import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ViewEncapsulation
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule
} from '@angular/forms';

@Component({
  selector: 'brickclay-radio-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './radio.html',
  styleUrl: './radio.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioComponent),
      multi: true
    }
  ]
})
export class RadioComponent implements ControlValueAccessor {

  @Input() radioClass = '';
  @Input() label = '';
  @Input() labelClass = '';
  @Input() value: any;
  @Input() disabled = false;
  @Input() variant: 'dot' | 'tick' = 'dot';

  @Output() change = new EventEmitter<any>();

  modelValue: any;

  onChange = (_: any) => {};
  onTouched = () => {};

  select(): void {
    if (this.disabled) return;

    if (this.modelValue !== this.value) {
      this.modelValue = this.value;
      this.onChange(this.value);
      this.onTouched();
      this.change.emit(this.value);
    }
  }

  get isChecked(): boolean {
    return this.modelValue === this.value;
  }

  writeValue(value: any): void {
    this.modelValue = value;
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
