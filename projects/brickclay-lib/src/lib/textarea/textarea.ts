import { Component, EventEmitter, Input, Optional, Output, Self } from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bk-textarea',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './textarea.html'
})
export class Textarea implements ControlValueAccessor {
  @Input() name!: string;
  @Input() id?: string;
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() rows: number = 4;
  @Input() hint: string = '';
  @Input() required: boolean = false;
  @Input() maxLength: number | null = null;
  @Input() hasError: boolean | null = false;
  @Input() errorMessage: string = '';
  @Input() trimWhiteSpaces: boolean = false;
  @Input() eventType: 'input' | 'change' | 'blur' = 'input';
  @Output() input = new EventEmitter<Event>();
  @Output() change = new EventEmitter<Event>();
  @Output() blur = new EventEmitter<Event>();
  @Output() focus = new EventEmitter<Event>();
  value: string = '';
  isDisabled: boolean = false;

  // --- ControlValueAccessor ---
  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(@Optional() @Self() private ngControl: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  // --- Computed ID ---
  get effectiveId(): string {
    const base = 'brickclay_textarea_';
    return this.id ? `${base}${this.id}` : `${base}${this.label?.replace(/\s+/g, '_').toLowerCase()}`;
  }

  // --- Expose FormControl state ---
  get control(): any {
    return this.ngControl?.control;
  }

  get touched(): boolean {
    return this.control?.touched;
  }

  get dirty(): boolean {
    return this.control?.dirty;
  }

  get errors(): any {
    return this.control?.errors;
  }

  get showError(): boolean {
  if (this.hasError) return true;
  if (!this.control) return false;

  return (
    this.required && (this.control.dirty || this.control.touched) &&
    this.control.invalid &&
    this.control.errors?.['required']
  );
}

  // --- Event handler ---
  handleEvent(event: Event): void {
    const input = event.target as HTMLTextAreaElement;

    // Always update internal value for the counter
    this.value = input.value;

    // Trim spaces if needed
    if (this.trimWhiteSpaces && this.eventType === 'input') {
      setTimeout(() => {
        this.value = this.value.trim();
        input.value = this.value;
        if (this.eventType === 'input') this.onChange(this.value);
      }, 300); // small delay for input event
    } else if (this.trimWhiteSpaces) {
      this.value = this.value.trim();
      input.value = this.value;
    }

    // Update ngModel depending on event type
    if (this.eventType === 'input' && event.type === 'input') this.onChange(this.value);
    if (this.eventType === 'change' && event.type === 'change') this.onChange(this.value);
    if (this.eventType === 'blur' && event.type === 'blur') this.onChange(this.value);

    // Always mark as touched on blur/focus
    if (event.type === 'blur' || event.type === 'focus') this.onTouched();
    // ---- Emit component outputs ----
    if (event.type === 'input') this.input.emit(event);
    if (event.type === 'change') this.change.emit(event);
    if (event.type === 'blur') this.blur.emit(event);
    if (event.type === 'focus') this.focus.emit(event);

  }

  writeValue(value: any): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
}
