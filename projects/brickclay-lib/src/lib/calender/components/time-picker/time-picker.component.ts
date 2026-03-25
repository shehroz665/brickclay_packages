import { BrickclayIcons } from '../../../assets/icons';
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, AfterViewInit, QueryList, ViewChildren, ElementRef, HostListener, SimpleChanges, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'bk-time-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BkTimePicker),
      multi: true,
    },
  ],
})
export class BkTimePicker implements OnInit, OnChanges, AfterViewInit, ControlValueAccessor {

  @Input() required: boolean = false;

  /** @deprecated Prefer [(ngModel)] */
  @Input() value: string | null = null;

  @Input() label: string = '';
  @Input() placeholder: string = 'Select time';
  @Input() clearable = false;
  @Input() position: 'left' | 'right' = 'left';
  @Input() variation: 'default' | 'lg' = 'default';
  @Input() pickerId: string = '';
  @Input() closePicker: number = 0;
  @Input() timeFormat: 12 | 24 = 12;
  @Input() showSeconds = false;

  @Output() change = new EventEmitter<string | null>();
  @Output() timeChange = new EventEmitter<string | null>();
  @Output() pickerOpened = new EventEmitter<string>();
  @Output() pickerClosed = new EventEmitter<string>();

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};
  @Input() disabled:boolean = false;

  @ViewChildren('timeScroll') timeScrollElements!: QueryList<ElementRef>;
  @ViewChildren('minuteScroll') minuteScrollElements!: QueryList<ElementRef>;
  @ViewChildren('secondScroll') secondScrollElements!: QueryList<ElementRef>;

  private readonly ITEM_HEIGHT = 32;
  private readonly WHEEL_CYCLE = 60;
  private readonly MIDDLE_OFFSET = this.WHEEL_CYCLE * this.ITEM_HEIGHT;

  wheelMinutes: number[] = Array.from({ length: this.WHEEL_CYCLE * 3 }, (_, i) => i % this.WHEEL_CYCLE);
  wheelSeconds: number[] = Array.from({ length: this.WHEEL_CYCLE * 3 }, (_, i) => i % this.WHEEL_CYCLE);

  showPicker = false;
  currentHour = 12;
  currentMinute = 0;
  currentSecond = 0;
  currentAMPM = 'PM';

  private _modelValue: string | null = null;

  brickclayIcons = BrickclayIcons;

  /* ---------------- CVA ---------------- */

  writeValue(value: string | null): void {

    if (!value) {
      this._modelValue = null;
      this.setDefaultsForDropdown();
      return;
    }

    this._modelValue = value;
    this.parseTimeValue(value);
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /* ---------------- Display ---------------- */

  getDisplayValue(): string {

    if (!this._modelValue) return '';

    return this.formatTimeFromComponents(
      this.currentHour,
      this.currentMinute,
      this.currentSecond,
      this.currentAMPM
    );
  }

  get hasValue(): boolean {
    return !!this._modelValue;
  }

  /* ---------------- Defaults ---------------- */

  private setDefaultsForDropdown(): void {

    if (this.timeFormat === 24) {
      this.currentHour = 0;
    } else {
      this.currentHour = 12;
      this.currentAMPM = 'PM';
    }

    this.currentMinute = 0;
    this.currentSecond = 0;
  }

  clear(): void {

    this._modelValue = null;
    this.value = null;

    this.setDefaultsForDropdown();

    this.onChange(null);
    this.change.emit(null);
    this.timeChange.emit(null);

    this.markAsTouched();
  }

  markAsTouched(): void {
    this.onTouched();
  }

  /* ---------------- Lifecycle ---------------- */

  ngOnInit() {
    this.parseTimeValue(this._modelValue ?? this.value);
  }

  ngAfterViewInit() {

    if (this.showPicker) {
      setTimeout(() => this.scrollToSelectedTimes(), 100);
    }
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes['value'] && !this._modelValue) {
      this.parseTimeValue(this.value);
    }

    if (changes['closePicker'] && this.showPicker) {

      const newCounter = changes['closePicker'].currentValue;

      if (newCounter > this.previousCloseCounter) {
        this.showPicker = false;
        this.markAsTouched();
        this.pickerClosed.emit(this.pickerId);
        this.previousCloseCounter = newCounter;
      }
    }
  }

  /* ---------------- Parse Logic ---------------- */

  parseTimeValue(timeStr?: string | null) {

    const str = timeStr ?? this._modelValue ?? this.value ?? '';

    if (!str) {
      this._modelValue = null;
      this.setDefaultsForDropdown();
      return;
    }

    this._modelValue = str;

    const parsed = this.parseTimeStringToComponents(str);

    this.currentHour = parsed.hour;
    this.currentMinute = parsed.minute;
    this.currentSecond = parsed.second;
    this.currentAMPM = parsed.ampm;
  }

  parseTimeStringToComponents(timeStr: string) {

    const parts = timeStr.trim().split(' ');
    const timePart = parts[0];
    let ampm = (parts[1] || '').toUpperCase();

    const [h, m, s] = timePart.split(':');

    let hour = parseInt(h || '0', 10);
    const minute = parseInt(m || '0', 10);
    const second = parseInt(s || '0', 10);

    if (this.timeFormat === 24) {

      return {
        hour: Math.min(Math.max(hour, 0), 23),
        minute: Math.min(Math.max(minute, 0), 59),
        second: Math.min(Math.max(second, 0), 59),
        ampm: ''
      };
    }

    if (!ampm) {

      if (hour >= 12) {
        ampm = 'PM';
        if (hour > 12) hour -= 12;
      } else {
        ampm = 'AM';
        if (hour === 0) hour = 12;
      }
    }

    if (hour < 1) hour = 1;
    if (hour > 12) hour = 12;

    return {
      hour,
      minute,
      second,
      ampm
    };
  }

  formatTimeFromComponents(hour: number, minute: number, second: number, ampm: string): string {

    const hStr = hour.toString().padStart(2, '0');
    const mStr = minute.toString().padStart(2, '0');
    const sStr = second.toString().padStart(2, '0');

    if (this.timeFormat === 24) {
      return this.showSeconds ? `${hStr}:${mStr}:${sStr}` : `${hStr}:${mStr}`;
    }

    return this.showSeconds
      ? `${hour}:${mStr}:${sStr} ${ampm}`
      : `${hour}:${mStr} ${ampm}`;
  }

  /* ---------------- Picker ---------------- */

  togglePicker() {

    if (!this.showPicker) {

      this.showPicker = true;

      this.parseTimeValue(this._modelValue);

      this.pickerOpened.emit(this.pickerId);

      setTimeout(() => this.scrollToSelectedTimes(), 100);

    } else {

      this.showPicker = false;
      this.markAsTouched();
      this.pickerClosed.emit(this.pickerId);
    }
  }

  /* ---------------- Change handlers ---------------- */

  onHourChange(hour: number) {
    this.currentHour = hour;
    this.updateTime();
  }

  onMinuteChange(minute: number) {
    this.currentMinute = minute;
    this.updateTime();
  }

  onSecondChange(second: number) {
    this.currentSecond = second;
    this.updateTime();
  }

  onAMPMChange(ampm: string) {
    this.currentAMPM = ampm;
    this.updateTime();
  }

  updateTime() {

    const newTime = this.formatTimeFromComponents(
      this.currentHour,
      this.currentMinute,
      this.currentSecond,
      this.currentAMPM
    );

    this._modelValue = newTime;
    this.value = newTime;

    this.onChange(newTime);
    this.change.emit(newTime);
    this.timeChange.emit(newTime);
  }

  /* ---------------- Scroll ---------------- */

  scrollToSelectedTimes() {

    this.timeScrollElements.forEach((elRef) => {

      const element = elRef.nativeElement;
      const selected = element.querySelector('.time-item.selected');

      if (selected) {

        element.scrollTop =
          selected.offsetTop -
          element.offsetHeight / 2 +
          selected.offsetHeight / 2;
      }
    });

    this.initMinuteWheelScroll();

    if (this.showSeconds) this.initSecondWheelScroll();
  }

  private initMinuteWheelScroll() {

    const el = this.minuteScrollElements?.first?.nativeElement;
    if (!el) return;

    el.scrollTop = this.MIDDLE_OFFSET + this.currentMinute * this.ITEM_HEIGHT;
  }

  private initSecondWheelScroll() {

    const el = this.secondScrollElements?.first?.nativeElement;
    if (!el) return;

    el.scrollTop = this.MIDDLE_OFFSET + this.currentSecond * this.ITEM_HEIGHT;
  }

  /* ---------------- Outside click ---------------- */

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {

    const target = event.target as HTMLElement;

    if (!target.closest('.time-picker-wrapper') && this.showPicker) {

      this.showPicker = false;
      this.markAsTouched();
      this.pickerClosed.emit(this.pickerId);
    }
  }

  private previousCloseCounter = 0;

  getHours(): number[] {
  if (this.timeFormat === 24) {
    return Array.from({ length: 24 }, (_, i) => i);
  }
  return Array.from({ length: 12 }, (_, i) => i + 1);
}

getAMPMOptions(): string[] {
  return ['PM','AM'];
}

onMinuteWheelScroll(): void {
  const el = this.minuteScrollElements?.first?.nativeElement;
  if (!el) return;

  let scrollTop = el.scrollTop;

  const maxScroll = this.MIDDLE_OFFSET * 2 - 50;

  if (scrollTop < this.MIDDLE_OFFSET - 100) {
    scrollTop += this.MIDDLE_OFFSET;
    el.scrollTop = scrollTop;
  } else if (scrollTop > maxScroll) {
    scrollTop -= this.MIDDLE_OFFSET;
    el.scrollTop = scrollTop;
  }

  const index = Math.round(scrollTop / this.ITEM_HEIGHT);
  const value = ((index % this.WHEEL_CYCLE) + this.WHEEL_CYCLE) % this.WHEEL_CYCLE;

  if (value !== this.currentMinute) {
    this.currentMinute = value;
    this.updateTime();
  }
}

onSecondWheelScroll(): void {
  const el = this.secondScrollElements?.first?.nativeElement;
  if (!el) return;

  let scrollTop = el.scrollTop;

  const maxScroll = this.MIDDLE_OFFSET * 2 - 50;

  if (scrollTop < this.MIDDLE_OFFSET - 100) {
    scrollTop += this.MIDDLE_OFFSET;
    el.scrollTop = scrollTop;
  } else if (scrollTop > maxScroll) {
    scrollTop -= this.MIDDLE_OFFSET;
    el.scrollTop = scrollTop;
  }

  const index = Math.round(scrollTop / this.ITEM_HEIGHT);
  const value = ((index % this.WHEEL_CYCLE) + this.WHEEL_CYCLE) % this.WHEEL_CYCLE;

  if (value !== this.currentSecond) {
    this.currentSecond = value;
    this.updateTime();
  }
}
}
