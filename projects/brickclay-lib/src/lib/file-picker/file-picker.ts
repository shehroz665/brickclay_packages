import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';

@Component({
  selector: 'bk-file-picker',
  imports: [CommonModule],
  templateUrl: './file-picker.html',
  styleUrl: './file-picker.css',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BkFilePicker),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => BkFilePicker),
      multi: true,
    },
  ],
})
export class BkFilePicker implements ControlValueAccessor, Validator {
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() accept: string = '';
  @Input() multi: boolean = false;
  // @Input() maxFileSizeKB: number | null = null;
  @Input() disable: boolean = false;
  @Input() errorMessage: string = '';
  @Input() hasError: boolean = false;
  @Input() draggable: boolean = true;
  @Input()
  set required(val: boolean) {
    this._required = val;
    this._onValidatorChange?.();
  }
  get required() {
    return this._required;
  }
  private _required = false;
  @Output() change = new EventEmitter<Event>();
  @Output() error = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();
  @ViewChild('fileInput') fileInputRef?: ElementRef<HTMLInputElement>;
  private _value: File | File[] | null = null;
  private _onValidatorChange?: () => void;
  private onChange: (value: File | File[] | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: File | File[] | null): void {
    this._value = value;

    if (!value && this.fileInputRef?.nativeElement) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disable = isDisabled;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if (this.required && !this._value) {
      return { required: true };
    }
    return null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this._onValidatorChange = fn;
  }

  get pickerState(): 'default' | 'active' | 'disabled' {
    if (this.disable) return 'disabled';
    return 'default';
  }

  onContainerClick(): void {
    if (this.disable) return;

    this.onTouched(); // ⭐ Touch on interaction start
    this.fileInputRef?.nativeElement?.click();
  }

  onFileChange(event: Event): void {
    // 1. Stop the native HTML change event from bubbling up to the <bk-file-picker> tag
    event.stopPropagation();

    const input = event.target as HTMLInputElement;
    const files = input.files;

    // 2. Case: User clicked 'Cancel' or no files selected
    // We update the form state (ngModel) but DO NOT emit the @Output() change
    if (!files?.length) {
      this._value = null;
      this.onChange(null);
      this.onTouched();
      return; // Exit without emitting change
    }

    const fileList = Array.from(files);

    // // 3. Case: File exceeds size limit
    // if (this.maxFileSizeKB != null) {
    //   const maxBytes = this.maxFileSizeKB * 1024;
    //   const oversized = fileList.filter((f) => f.size > maxBytes);

    //   if (oversized.length > 0) {
    //     this.error.emit(`File size exceeds ${this.maxFileSizeKB} KB limit.`);

    //     // Reset internal state and form control
    //     this._value = null;
    //     this.onChange(null);
    //     this.onTouched();

    //     // Reset the physical input so the same file can be picked again later
    //     input.value = '';

    //     return; // Exit without emitting change
    //   }
    // }

    // 4. Case: Valid selection
    const value = this.multi ? fileList : (fileList[0] ?? null);

    this._value = value;
    this.onChange(value); // Updates ngModel
    this.onTouched();

    // Only emit the custom @Output() now
    this.change.emit(event);
  }

  onCancel(): void {
    // Check if there is currently no file selected
    if (!this._value) {
      // Reset internal state and notify Angular Forms that the value is null
      this._value = null;
      this.onChange(null);

      // Mark the control as touched to trigger 'required' error visibility
      this.onTouched();

      // Force Angular to re-run the 'validate()' function immediately
      this._onValidatorChange?.();

      // Clear the native file input value to ensure the browser reset is in sync
      if (this.fileInputRef?.nativeElement) {
        this.fileInputRef.nativeElement.value = '';
      }

      // Clear any previous error messages (e.g., size limit errors)
      this.cancel.emit();
    }
  }

  onDragOver(event: DragEvent): void {
    if (this.disable) return;
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    if (this.disable) return;
    event.preventDefault();
    event.stopPropagation();
    const input = this.fileInputRef?.nativeElement;
    if (!input) return;
    const items = event.dataTransfer?.items;
    if (!items?.length) return;
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const file = items[i].getAsFile();
      if (file) files.push(file);
    }
    if (files.length === 0) return;
    const dt = new DataTransfer();
    (this.multi ? files : [files[0]]).forEach((f) => dt.items.add(f));
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
}
