import { CommonModule } from '@angular/common';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
  ViewChild,
  forwardRef,
  Output,
  EventEmitter
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR
} from '@angular/forms';


export type BkInputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'url'
  | 'tel';
export type BkInputAutoComplete =
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

export type BkInputAutoCapitalize =
  | 'off'
  | 'none'
  | 'on'
  | 'sentences'
  | 'words'
  | 'characters';

export type BkInputMode =
  | 'none'
  | 'text'
  | 'tel'
  | 'url'
  | 'email'
  | 'numeric'
  | 'decimal'
  | 'search';

export type IconOrientation = 'left' | 'right';
export interface CountryOption {
  code: string;
  name: string;
  mask: string;
  prefix:string;
  placeholder:string;
}
@Component({
  selector: 'bk-input',
  imports: [CommonModule,NgxMaskDirective,FormsModule],
  templateUrl: './input.html',
  styleUrl: './input.css',
  standalone: true,
  providers: [
    provideNgxMask(),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BkInput),
      multi: true
    }
  ]
})
export class BkInput implements OnInit, OnDestroy, ControlValueAccessor {

  // =================== Inputs (all your original ones) ===================
  @Input() id!: string ;
  @Input() name!: string ;
  @Input() mask: string | null= null;
  @Input() autoComplete : BkInputAutoComplete = 'off';
  @Input() label: string = '';
  @Input() placeholder: string = 'stephend@i2cinc.com';
  @Input() hint: string = '';
  @Input() required: boolean = false;
  @Input() type: BkInputType = 'text';
  @Input() value: string = '';
  @Input() hasError: boolean = false;
  @Input() showErrorIcon:boolean=false;
  @Input() errorMessage: string = '';
  @Input() disabled: boolean = false;
  @Input() tabIndex: number | null = null;
  @Input() readOnly: boolean = false;
  @Input() autoCapitalize: BkInputAutoComplete | null = null;
  @Input() inputMode: BkInputMode | null = null;
  @Input() iconSrc?: string;
  @Input() iconAlt: string = 'icon';
  @Input() showIcon: boolean = true;
  @Input() phone: boolean = false;
  @Input() countryCode: string = 'US';
  @Input() countryOptions: CountryOption[] = [
  { code: 'US', name: 'US', mask: '(000) 000-0000', prefix: '+1 ',placeholder:'(000) 000-0000' },
  { code: 'MT', name: 'MT', mask: '(000) 000-0000', prefix: '+356 ',placeholder:'(000) 000-0000' },
  { code: 'PL', name: 'PL', mask: '(000) 000-0000', prefix: '+48 ',placeholder:'(000) 000-0000' },
  { code: 'CH', name: 'CH', mask: '(000) 000-0000', prefix: '+41 ' ,placeholder:'(000) 000-0000'},
  { code: 'TR', name: 'TR', mask: '(000) 000-0000', prefix: '+90 ' ,placeholder:'(000) 000-0000'},
  { code: 'UG', name: 'UG', mask: '(000) 000-0000', prefix: '+256 ',placeholder:'(000) 000-0000' },
  { code: 'ZM', name: 'ZM', mask: '(000) 000-0000', prefix: '+260 ',placeholder:'(000) 000-0000' }
];

  selectedCountry: CountryOption= this.countryOptions[0];
  @Input() iconOrientation: IconOrientation = 'left'

  @Input() password: boolean = false;
  @Input() showPassword: boolean = false;

  @Input() pattern?: string|null;
  @Input() max: number|null = null;
  @Input() min: number|null = null;
  @Input() step: number|null = null;
  @Input() maxlength: number|null = null;
  @Input() minlength: number|null = null;
  // =================== ViewChild ===================
  @ViewChild('dropdownRef') dropdownRef?: ElementRef;
  @ViewChild('selectRef') selectRef?: ElementRef;
  @ViewChild('inputField') inputField?: ElementRef<HTMLInputElement>;

  // =================== Internal State ===================
  isFocused: boolean = false;
  inputValue: string = '';
  isDropdownOpen: boolean = false;


  // =================== Output Emitter ===================
  @Output() input = new EventEmitter<Event>();
  @Output() change = new EventEmitter<Event>();
  @Output() focus = new EventEmitter<Event>();
  @Output() blur = new EventEmitter<Event>();
  @Output() clicked = new EventEmitter<boolean>();

  get placeHolderText(): string {
   if (this.phone) {
      const country = this.countryOptions.find(c => c.code === this.countryCode);
      return country?.placeholder || '';
    }
    return this.placeholder;
  }

   get maskValue(): string {
    if (this.mask) return this.mask;
    if (this.phone) {
      const country = this.countryOptions.find(c => c.code === this.countryCode);
      return country?.mask || '';
    }
    return '';
  }

  get maskPrefixValue(): string {
    if (this.phone) {

      const country = this.countryOptions.find(c => c.code === this.countryCode);
      return country?.prefix || '';
    }
    return '';
  }

  // =================== CVA Callbacks ===================
  private onChange = (value: any) => {};
  private onTouched = () => {};

  writeValue(value: any): void {
    this.value = value || '';
    this.inputValue = this.value;
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

  // =================== Lifecycle ===================
  private closeAllDropdownsHandler = () => {
    if (this.phone && this.isDropdownOpen) this.isDropdownOpen = false;
  };

  ngOnInit(): void {
    if (this.value) this.inputValue = this.value;
    if (this.password && this.type !== 'password') this.type = 'password';
    if (this.phone) {
      const country = this.countryOptions.find(c => c.code === this.countryCode);

      if (country) this.selectedCountry = country;
      document.addEventListener('closeAllPhoneDropdowns', this.closeAllDropdownsHandler);
    }
  }

  ngOnDestroy(): void {
    if (this.phone) {
      document.removeEventListener('closeAllPhoneDropdowns', this.closeAllDropdownsHandler);
    }
  }

  // =================== Host Listener ===================
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.phone && this.isDropdownOpen) {
      const target = event.target as HTMLElement;
      if (this.selectRef?.nativeElement && this.dropdownRef?.nativeElement) {
        const clickedInside =
          this.selectRef.nativeElement.contains(target) ||
          this.dropdownRef.nativeElement.contains(target);
        if (!clickedInside) this.isDropdownOpen = false;
      }
    }
  }

  // =================== Event Handlers ===================
  handleFocus(event: Event): void {
    this.focus.emit(event);
    if (!this.disabled) this.isFocused = true;
  }

  handleBlur(event:Event): void {
    this.isFocused = false;
    this.onTouched();
    this.blur.emit(event);
  }
  handleInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.inputValue = val;
    this.value = val;       // update CVA value
    this.onChange(val);     // propagate to parent form
    this.input.emit(event); // emit raw event
  }

  handleClicked():void {
    this.clicked.emit(true);
  }

  handleChange(event: Event) {
    this.change.emit(event); // emit raw change event
  }

  toggleDropdown(event?: Event): void {
    if (!this.disabled && this.phone) {
      if (!this.isDropdownOpen) {
        document.dispatchEvent(new CustomEvent('closeAllPhoneDropdowns'));
        setTimeout(() => (this.isDropdownOpen = true), 0);
      } else {
        this.isDropdownOpen = false;
      }
      event?.stopPropagation();
    }
  }

selectCountry(country: CountryOption): void {
  const oldCountry = this.selectedCountry;
  this.selectedCountry = country;
  this.countryCode = country.code;
  this.isDropdownOpen = false;

  const currentRaw = this.inputField?.nativeElement?.value || this.inputValue;
  let newPhone = '';

  if (currentRaw && currentRaw.trim() !== '') {
    // Input has some value → replace old prefix
    if (oldCountry?.prefix && oldCountry.code !== country.code) {
      const oldPrefixEscaped = oldCountry.prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`^${oldPrefixEscaped}\\s?`);
      const oldMaskedValue = currentRaw.replace(regex, '');
      newPhone = country.prefix + oldMaskedValue;
    } else {
      newPhone = country.prefix + currentRaw;
    }
  } else {
    // Input is empty → show only the new prefix OR empty
    newPhone = ''; // optionally: newPhone = country.prefix;
  }

  this.inputValue = newPhone;
  this.value = newPhone;
  this.onChange(newPhone);

  setTimeout(() => {
    if (this.inputField?.nativeElement) {
      this.inputField.nativeElement.value = newPhone;
      this.inputField.nativeElement.dispatchEvent(
        new Event('input', { bubbles: true })
      );
    }
  }, 0);
}





  togglePasswordVisibility(event: Event): void {
    if (!this.disabled && this.password) {
      event.preventDefault();
      event.stopPropagation();
      this.showPassword = !this.showPassword;
      this.type = this.showPassword ? 'text' : 'password';
    }
  }

  handleIconClick(event: Event): void {
    if (this.disabled || this.readOnly) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.clicked.emit(true);
  }

  // =================== Getters ===================
  get isFilled(): boolean {
    return this.inputValue.length > 0;
  }

  get inputState(): 'default' | 'focused' | 'filled' | 'error' | 'disabled' {
    if (this.disabled) return 'disabled';
    if (this.hasError) return 'error';
    if (this.isFocused || this.isDropdownOpen) return 'focused';
    if (this.isFilled) return 'filled';
    return 'default';
  }

  get currentInputType(): string {
    if (this.password) return this.showPassword ? 'text' : 'password';
    return this.type;
  }




}
