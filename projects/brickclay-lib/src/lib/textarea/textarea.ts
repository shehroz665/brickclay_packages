import { Component, EventEmitter, Input, Optional, Output, Self } from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
export type AutoComplete =
  | 'on'
  | 'off'
  | 'name'
  | 'honorific-prefix'
  | 'given-name'
  | 'additional-name'
  | 'family-name'
  | 'honorific-suffix'
  | 'nickname'
  | 'email'
  | 'username'
  | 'new-password'
  | 'current-password'
  | 'organization-title'
  | 'organization'
  | 'street-address'
  | 'address-line1'
  | 'address-line2'
  | 'address-line3'
  | 'address-level4'
  | 'address-level3'
  | 'address-level2'
  | 'address-level1'
  | 'country'
  | 'country-name'
  | 'postal-code'
  | 'cc-name'
  | 'cc-given-name'
  | 'cc-additional-name'
  | 'cc-family-name'
  | 'cc-number'
  | 'cc-exp'
  | 'cc-exp-month'
  | 'cc-exp-year'
  | 'cc-csc'
  | 'cc-type'
  | 'transaction-currency'
  | 'transaction-amount'
  | 'language'
  | 'bday'
  | 'bday-day'
  | 'bday-month'
  | 'bday-year'
  | 'sex'
  | 'tel'
  | 'tel-country-code'
  | 'tel-national'
  | 'tel-area-code'
  | 'tel-local'
  | 'tel-extension'
  | 'impp'
  | 'url'
  | 'photo';

export type AutoCapitalize =
  | 'off'
  | 'none'
  | 'on'
  | 'sentences'
  | 'words'
  | 'characters';

export type InputMode =
  | 'none'
  | 'text'
  | 'tel'
  | 'url'
  | 'email'
  | 'numeric'
  | 'decimal'
  | 'search';
@Component({
  selector: 'bk-textarea',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './textarea.html'
})
export class BkTextarea implements ControlValueAccessor {
  @Input() autoComplete : AutoComplete = 'off';
  @Input() name!: string;
  @Input() id!: string;
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() rows: number = 4;
  @Input() hint: string = '';
  @Input() required: boolean = false;
  @Input() maxlength: number | null = null;
  @Input() minlength: number | null = null;
  @Input() hasError: boolean | null = false;
  @Input() disabled: boolean = false;
  @Input() errorMessage: string = '';
  @Input() tabIndex: number | null = null;
  @Input() readOnly: boolean = false;
  @Input() autoCapitalize: AutoCapitalize | null = null;
  @Input() inputMode: InputMode | null = null;
  @Output() input = new EventEmitter<Event>();
  @Output() change = new EventEmitter<Event>();
  @Output() blur = new EventEmitter<Event>();
  @Output() focus = new EventEmitter<Event>();
  value: string = '';


  // --- ControlValueAccessor ---
  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(@Optional() @Self() private ngControl: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
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




  handleFocus(event: Event): void {
    this.focus.emit(event);
  }

  handleBlur(event:Event): void {
    this.onTouched();
    this.blur.emit(event);
  }
  handleInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;       // update CVA value
    this.onChange(val);     // propagate to parent form
    this.input.emit(event); // emit raw event
  }

  handleChange(event: Event) {
    this.change.emit(event); // emit raw change event
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


}
