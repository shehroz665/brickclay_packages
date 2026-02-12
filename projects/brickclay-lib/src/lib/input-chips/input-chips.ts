import { Component, Input, forwardRef, ViewChild, ElementRef, AfterViewInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'bk-input-chips',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input-chips.html',
  styleUrl: './input-chips.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BkInputChips),
      multi: true
    }
  ]
})
export class BkInputChips implements ControlValueAccessor, AfterViewInit {
  @ViewChild('badgeInput') badgeInput!: ElementRef<HTMLInputElement>;
  @ViewChild('fieldWrapper') fieldWrapper!: ElementRef<HTMLDivElement>;

  // --- Configuration Inputs ---
  @Input() id!: string ;
  @Input() name!: string ;
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() hint: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() readOnly: boolean = false;
  /**
   * If true, displays the component in an error state (red border).
   * It also replaces the hint text with the error message.
   */
  @Input() hasError: boolean = false;
  @Input() errorMessage: string = 'This is a error message';
  // =================== Output Emitter ===================
  @Output() input = new EventEmitter<Event>();
  @Output() change = new EventEmitter<string[]>();

  @Output() focus = new EventEmitter<Event>();
  @Output() blur = new EventEmitter<Event>();
  // --- State Properties ---
  badges: string[] = [];
  inputValue: string = '';
  isFocused: boolean = false;
  needsScroll: boolean = false;

  // --- ControlValueAccessor Methods ---
  onChange: any = () => {};
  onTouched: any = () => {};

  // Get input state for styling variants
  get inputState(): 'default' | 'focused' | 'filled' | 'error' | 'disabled' {
    if (this.disabled) return 'disabled';
    if (this.hasError) return 'error';
    if (this.isFocused) return 'focused';
    if (this.badges.length > 0 || this.inputValue.length > 0) return 'filled';
    return 'default';
  }



  // Handle keydown events (Enter to add badge, Backspace to remove)
  onKeyDown(event: KeyboardEvent): void {
    if (this.disabled) return;

    // Add badge on Enter or comma
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addBadge();
    }
    // Remove last badge on Backspace when input is empty
    else if (event.key === 'Backspace' && this.inputValue === '' && this.badges.length > 0) {
      this.removeBadge(this.badges.length - 1);
    }
  }

  // Add a badge from the current input value
  addBadge(): void {
    const trimmedValue = this.inputValue.trim();
    if (trimmedValue && !this.badges.includes(trimmedValue)) {
      this.badges.push(trimmedValue);
      this.inputValue = '';
      this.updateValue();
      // Check if scroll is needed after adding badge (with delay for DOM update)
      setTimeout(() => this.checkScrollNeeded(), 10);
    } else if (trimmedValue && this.badges.includes(trimmedValue)) {
      // Optionally show a message that badge already exists
      this.inputValue = '';
    }
  }

  // Remove a badge at the given index
  removeBadge(index: number): void {
    if (this.disabled) return;
    this.badges.splice(index, 1);
    this.updateValue();
    // Check if scroll is needed after removing badge (with delay for DOM update)
    setTimeout(() => {
      this.checkScrollNeeded();
      if (this.badgeInput) {
        this.badgeInput.nativeElement.focus();
      }
    }, 10);
  }

  // Check if scrolling is needed (when content wraps)
  checkScrollNeeded(): void {
    if (this.fieldWrapper && this.fieldWrapper.nativeElement) {
      const wrapper = this.fieldWrapper.nativeElement;

      // Get all badge items
      const badgeItems = wrapper.querySelectorAll('.input-badge-item');

      if (badgeItems.length === 0) {
        // No badges, no scroll needed
        this.needsScroll = false;
        return;
      }

      // Get the first badge's top position
      const firstBadge = badgeItems[0] as HTMLElement;
      const firstBadgeTop = firstBadge.offsetTop;

      // Check if any badge is on a different line (different top position)
      let hasWrapped = false;
      for (let i = 1; i < badgeItems.length; i++) {
        const badge = badgeItems[i] as HTMLElement;
        // If a badge's top position is different, it means it wrapped to a new line
        if (Math.abs(badge.offsetTop - firstBadgeTop) > 5) {
          hasWrapped = true;
          break;
        }
      }

      // Also check if the input field is on a different line
      if (!hasWrapped && this.badgeInput && this.badgeInput.nativeElement) {
        const inputTop = this.badgeInput.nativeElement.offsetTop;
        if (Math.abs(inputTop - firstBadgeTop) > 5) {
          hasWrapped = true;
        }
      }

      // Only enable scroll if content actually wrapped
      this.needsScroll = hasWrapped;
    }
  }

  // Update the value and notify Angular Forms
  updateValue(): void {
    this.onChange([...this.badges]);
    this.change.emit([...this.badges]);
  }

  // Focus the input field
  focusInput(): void {
    if (!this.disabled && this.badgeInput) {
      this.badgeInput.nativeElement.focus();
    }
  }

  ngAfterViewInit(): void {
    // Check scroll after view initializes
    setTimeout(() => this.checkScrollNeeded(), 10);
  }

  // Called when Angular writes a value TO the component (e.g. initial value)
  writeValue(value: any): void {
    if (Array.isArray(value)) {
      this.badges = [...value];
    } else {
      this.badges = [];
    }
    this.inputValue = '';
    // Check scroll after value is written (with delay for DOM update)
    setTimeout(() => this.checkScrollNeeded(), 10);
  }

  // Register function to call when value changes
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // Register function to call when component is touched/blurred
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // Called when the component is disabled via the form control
  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }

  // =================== Event Handlers ===================

  // Called when the value in the UI changes (user types)
  handleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.inputValue = input.value;
  }


  handleFocus(event: Event): void {
    if (!this.disabled) {
    this.isFocused = true;
    }
    this.onChange([...this.badges]);
    this.focus.emit(event);
  }

  handleBlur(event:Event): void {
    this.isFocused = false;
    this.onTouched();
    this.onChange([...this.badges]);
    this.blur.emit(event);
  }



}
