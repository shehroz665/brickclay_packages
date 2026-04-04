import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener, OnChanges, SimpleChanges, ViewChild, ElementRef, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormsModule, Validator, AbstractControl, ValidationErrors } from '@angular/forms';
import { BkCalendarManagerService, CalendarRange } from '../../services/calendar-manager.service';
import { Subscription } from 'rxjs';
import { BkTimePicker } from '../time-picker/time-picker.component';
import moment from 'moment';
import { BrickclayIcons } from '../../../assets/icons';

export type { CalendarRange } from '../../services/calendar-manager.service';

export class CalendarSelection {
  startDate: string | null = null;
  endDate: string | null = null;
  /** Start time in 12-hour format with AM/PM (e.g. "1:00 AM"). */
  startTime: string | null = null;
  /** End time in 12-hour format with AM/PM (e.g. "2:00 AM"). */
  endTime: string | null = null;
  selectedDates?: string[] = []; // For multi-date selection
}

@Component({
  selector: 'bk-custom-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, BkTimePicker],
  templateUrl: './custom-calendar.component.html',
  styleUrls: ['./custom-calendar.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BkCustomCalendar),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => BkCustomCalendar),
      multi: true,
    },
  ],
})
export class BkCustomCalendar implements OnInit, OnDestroy, OnChanges, ControlValueAccessor, Validator {

  // Basic Options
  @Input() enableTimepicker = false;
  @Input() autoApply = false;
  @Input() closeOnAutoApply = false;
  @Input() showCancel = true;
  @Input() linkedCalendars = false;
  @Input() singleDatePicker = false;
  @Input() showWeekNumbers = false;
  @Input() showISOWeekNumbers = false;
  @Input() customRangeDirection = false;
  @Input() lockStartDate = false;
  @Input() position: 'center' | 'left' | 'right' = 'left';
  /** Vertical placement relative to the input. Takes precedence over {@link drop} for default bottom placement. */
  @Input() popupPosition: 'top' | 'bottom' = 'bottom';
  @Input() drop: 'up' | 'down' = 'down';
  @Input() dualCalendar = false;
  @Input() showRanges = true;
  @Input() timeFormat: 12 | 24 = 12;
  @Input() clearableTime: boolean = false;
  @Input() enableSeconds = false;
  @Input() customRanges?: Record<string, CalendarRange>;
  /** Column headers for weekdays; index 0 is the first column. Default Monday–Sunday. */
  @Input() weekDayLabels: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  @Input() multiDateSelection = false; // NEW: Enable multi-date selection
  @Input() maxDate?: Date; // NEW: Maximum selectable date
  @Input() minDate?: Date; // NEW: Minimum selectable date
  @Input() placeholder = 'Select date range'; // NEW: Custom placeholder
  @Input() opens: 'left' | 'right' | 'center' = 'left'; // NEW: Popup position
  @Input() inline = false; // NEW: Always show calendar inline (no popup)
  @Input() appendToBody = false; // When true, positions popup with fixed so it isn't clipped inside dialogs/overflow
  @Input() isDisplayCrossIcon = true; // NEW: Show/Hide clear (X) icon
  @Input() hasError = false; // NEW: Show/Hide clear (X) icon
  @Input() errorMessage  = ''
  @Output() selected = new EventEmitter<CalendarSelection>();

  @ViewChild('inputWrapper') inputWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('calendarPopup') calendarPopupRef?: ElementRef<HTMLDivElement>;

  /** Used when appendToBody is true to position the popup in viewport coordinates */
  dropdownStyle: { top?: string; bottom?: string; left?: string } = {};
  /** Resolved after layout; used for CSS `drop-up` and appendToBody positioning with viewport flip */
  popupPlacementAbove = false;
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
  @Input() showCancelApply = true;
  /**
   * External value passed from parent / ngModel. When used with ngModel, this is the bound value.
   * Accepts { startDate: string|null, endDate: string|null, selectedDates?: string[] }
   */
  @Input() selectedValue: CalendarSelection | null = null;
  /** Optional display format for the input value. Uses moment formatting tokens. */
  @Input() displayFormat = 'MM/DD/YYYY';
  /** When true, the control is required (used with ngModel for validation: dirty, touched, invalid). */
  @Input() required = false;

  /** CVA: called when form control value is set (e.g. ngModel binding) */
  private onChange: (value: CalendarSelection | null) => void = () => {};
  /** CVA: called when control is touched (blur / close) */
  private onTouched: () => void = () => {};
  disabled = false;

  brickclayIcons = BrickclayIcons;

  show = false;
  today = new Date();
  month = this.today.getMonth();
  year = this.today.getFullYear();
  calendar: { day: number, currentMonth: boolean }[][] = [];
  leftMonth!: number;
  leftYear!: number;
  rightMonth!: number;
  rightYear!: number;
  leftCalendar: { day: number, currentMonth: boolean }[][] = [];
  rightCalendar: { day: number, currentMonth: boolean }[][] = [];
  startDate: Date | null = null;
  endDate: Date | null = null;
  selectedDates: Date[] = []; // NEW: For multi-date selection
  disableHighlight = false;
  hoveredDate: Date | null = null; // For hover preview

  // Track raw input values for minutes to allow free typing
  minuteInputValues: { [key: string]: string } = {};

  // Time picker for single calendar (12-hour format: 1-12)
  selectedHour = 1;
  selectedMinute = 0;
  selectedSecond = 0;
  selectedAMPM: 'AM' | 'PM' = 'AM';

  // NEW: Separate time pickers for dual calendar (12-hour format: 1-12)
  startHour = 1;
  startMinute = 0;
  startSecond = 0;
  startAMPM: 'AM' | 'PM' = 'AM';
  endHour = 2;
  endMinute = 0;
  endSecond = 0;
  endAMPM: 'AM' | 'PM' = 'AM';

  /** Current start time string in 12-hour format with AM/PM (e.g. "1:00 AM"). Synced with ngModel/CalendarSelection. */
  startTime: string | null = null;
  /** Current end time string in 12-hour format with AM/PM (e.g. "2:00 AM"). Synced with ngModel/CalendarSelection. */
  endTime: string | null = null;

  /** ngModel binding for single-calendar time picker (null = no time). */
  singleTimeModel: string | null = null;
  /** ngModel binding for dual-calendar start time picker (null = no time). */
  startTimeModel: string | null = null;
  /** ngModel binding for dual-calendar end time picker (null = no time). */
  endTimeModel: string | null = null;

  // Track open time-picker within this calendar (for single-open behavior)
  openTimePickerId: string | null = null;
  closePickerCounter: { [key: string]: number } = {};

  activeRange: string | null = null; // Track which range is currently active
  @Input() rangeOrder: string[] = []; // Maintain order of ranges

  /** Keyboard roving focus for date grid (local date, midnight) */
  keyboardFocusDate: Date | null = null;

  private unregisterFn?: () => void;
  private closeAllSubscription?: Subscription;
  private closeFn?: () => void;

  constructor(private calendarManager: BkCalendarManagerService) {}

  /** Weekday headers; falls back to Mon–Sun if the input is not length 7. */
  get resolvedWeekDayLabels(): string[] {
    const d = this.weekDayLabels;
    if (d?.length === 7) return d;
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  }

  /** When dual range mode, Apply is blocked until both endpoints exist. */
  get isDualRangeApplyBlocked(): boolean {
    if (!this.dualCalendar || this.singleDatePicker || this.multiDateSelection) return false;
    return !this.startDate || !this.endDate;
  }

  /**
   * Popup single-date with manual Apply: do not push to ngModel / (selected) until Apply.
   * Inline calendars have no Apply footer, so they always commit immediately.
   */
  private shouldDeferSingleDateCommit(): boolean {
    return this.singleDatePicker && !this.autoApply && !this.inline;
  }

  private emitSelectionUnlessSingleDateDeferred(): void {
    if (this.shouldDeferSingleDateCommit()) return;
    this.emitSelection();
  }

  /** Discard in-popup draft and restore last committed value from {@link selectedValue}. */
  private revertSingleDateDraftIfNeeded(): void {
    if (this.shouldDeferSingleDateCommit()) {
      this.applyValueToState(this.selectedValue ?? null);
    }
  }

  private finishPopupDismissal(): void {
    if (this.inline) return;
    this.revertSingleDateDraftIfNeeded();
    this.show = false;
    this.onTouched();
    this.closed.emit();
  }

  /** User preference before viewport adjustment (legacy `drop` still applies when `popupPosition` is `bottom`). */
  private preferPopupAbove(): boolean {
    return this.popupPosition === 'top' || (this.popupPosition === 'bottom' && this.drop === 'up');
  }

  private resolveCustomRangesFromInputsOrService(): void {
    const svc = this.calendarManager.getCustomRanges();
    if (!this.customRanges) {
      this.customRanges = { ...svc.customRanges! };
      this.rangeOrder = [...svc.rangeOrder];
    } else {
      if (!this.rangeOrder?.length) {
        const keys = Object.keys(this.customRanges);
        const ordered = svc.rangeOrder.filter(k => keys.includes(k));
        const rest = keys.filter(k => !ordered.includes(k));
        this.rangeOrder = [...ordered, ...rest];
      }
      if (!this.customRanges['Custom Range']) {
        this.customRanges['Custom Range'] = { start: new Date(), end: new Date() };
      }
    }
  }

  private labelToJsWeekday(label: string): number {
    const key = label.replace(/\./g, '').trim().toLowerCase();
    const map: Record<string, number> = {
      sun: 0, sunday: 0, su: 0,
      mon: 1, monday: 1, mo: 1,
      tue: 2, tues: 2, tuesday: 2, tu: 2,
      wed: 3, wednesday: 3, we: 3,
      thu: 4, thur: 4, thurs: 4, thursday: 4, th: 4,
      fri: 5, friday: 5, fr: 5,
      sat: 6, saturday: 6, sa: 6,
    };
    return map[key] ?? 1;
  }

  private getWeekStartDayIndex(): number {
    return this.labelToJsWeekday(this.resolvedWeekDayLabels[0] ?? 'Mon');
  }

  // --- ControlValueAccessor implementation ---
  writeValue(value: CalendarSelection | null): void {
    this.selectedValue = value ?? null;
    this.applyValueToState(this.selectedValue);
  }

  registerOnChange(fn: (value: CalendarSelection | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /** Validator: when required is true, value must have a date selected. */
  validate(control: AbstractControl): ValidationErrors | null {
    if (!this.required) return null;
    const value = control.value as CalendarSelection | null;
    if (!value) return { required: true };
    if (this.multiDateSelection) {
      if (!value.selectedDates || value.selectedDates.length === 0) return { required: true };
    } else {
      if (!value.startDate) return { required: true };
    }
    return null;
  }

  /** Call from template when control loses focus (for CVA touched state). */
  markAsTouched(): void {
    this.onTouched();
  }

  /** Clears embedded time picker ngModels, spinner state, raw minute typing, and forces dropdowns closed. */
  private resetEmbeddedTimePickerUiState(): void {
    this.singleTimeModel = null;
    this.startTimeModel = null;
    this.endTimeModel = null;
    this.selectedHour = 1;
    this.selectedMinute = 0;
    this.selectedSecond = 0;
    this.selectedAMPM = 'AM';
    this.startHour = 1;
    this.startMinute = 0;
    this.startSecond = 0;
    this.startAMPM = 'AM';
    this.endHour = 2;
    this.endMinute = 0;
    this.endSecond = 0;
    this.endAMPM = 'AM';
    this.minuteInputValues = {};
    this.openTimePickerId = null;
    for (const id of ['single-time', 'dual-start', 'dual-end'] as const) {
      this.closePickerCounter[id] = (this.closePickerCounter[id] || 0) + 1;
    }
  }

  /** Apply CalendarSelection to internal state (startDate, endDate, startTime, endTime, selectedDates, calendar view). */
  private applyValueToState(value: CalendarSelection | null): void {
    if (!value) {
      this.startDate = null;
      this.endDate = null;
      this.startTime = null;
      this.endTime = null;
      this.selectedDates = [];
      this.activeRange = null;
      this.resetEmbeddedTimePickerUiState();
      this.month = this.today.getMonth();
      this.year = this.today.getFullYear();
      this.generateCalendar();
      if (this.dualCalendar) {
        this.initializeDual();
      }
      return;
    }
    const s = value;
    this.startDate = s.startDate ? this.parseDateString(s.startDate) : null;
    this.endDate = s.endDate ? this.parseDateString(s.endDate) : null;
    this.selectedDates = (s.selectedDates || []).map((d) => typeof d === 'string' ? this.parseDateString(d) : new Date(d));
    this.startTime = s.startTime ?? null;
    this.endTime = s.endTime ?? null;

    const focusDate = this.startDate ?? this.endDate ?? new Date();
    this.month = focusDate.getMonth();
    this.year = focusDate.getFullYear();
    if (this.dualCalendar) {
      this.initializeDual();
      if (this.startDate) {
        this.leftMonth = this.startDate.getMonth();
        this.leftYear = this.startDate.getFullYear();
      }
      if (this.endDate && this.startDate) {
        const startMonth = this.startDate.getMonth();
        const startYear = this.startDate.getFullYear();
        const endMonth = this.endDate.getMonth();
        const endYear = this.endDate.getFullYear();
        if (endMonth !== startMonth || endYear !== startYear) {
          this.rightMonth = endMonth;
          this.rightYear = endYear;
        } else {
          this.rightMonth = this.leftMonth + 1;
          this.rightYear = this.leftYear;
          if (this.rightMonth > 11) {
            this.rightMonth = 0;
            this.rightYear++;
          }
        }
      } else if (this.endDate && !this.startDate) {
        this.rightMonth = this.endDate.getMonth();
        this.rightYear = this.endDate.getFullYear();
      } else {
        this.rightMonth = this.leftMonth + 1;
        this.rightYear = this.leftYear;
        if (this.rightMonth > 11) {
          this.rightMonth = 0;
          this.rightYear++;
        }
      }
      this.generateDualCalendars();
    } else {
      this.generateCalendar();
    }

    if (this.startTime) {
      const startParsed = this.parsePickerTimeString(this.startTime);
      this.startHour = startParsed.hour12;
      this.startMinute = startParsed.minute;
      this.startAMPM = startParsed.ampm;
      if (this.startDate) {
        let h24 = startParsed.hour12;
        if (startParsed.ampm === 'PM' && h24 < 12) h24 += 12;
        if (startParsed.ampm === 'AM' && h24 === 12) h24 = 0;
        this.startDate.setHours(h24, startParsed.minute, this.startSecond);
      }
      this.selectedHour = this.startHour;
      this.selectedMinute = this.startMinute;
      this.selectedAMPM = this.startAMPM;
    } else if (this.startDate) {
      // Date-only committed value: keep startTime null; sync spinners for UX only (not emitted until user sets time).
      this.initializeTimeFromDate(this.startDate, true);
      if (!this.dualCalendar) {
        this.selectedHour = this.startHour;
        this.selectedMinute = this.startMinute;
        this.selectedAMPM = this.startAMPM;
      }
    }

    if (this.endTime) {
      const endParsed = this.parsePickerTimeString(this.endTime);
      this.endHour = endParsed.hour12;
      this.endMinute = endParsed.minute;
      this.endAMPM = endParsed.ampm;
      if (this.endDate) {
        let h24 = endParsed.hour12;
        if (endParsed.ampm === 'PM' && h24 < 12) h24 += 12;
        if (endParsed.ampm === 'AM' && h24 === 12) h24 = 0;
        this.endDate.setHours(h24, endParsed.minute, this.endSecond);
      }
    } else if (this.endDate) {
      this.initializeTimeFromDate(this.endDate, false);
    }

    if (this.startDate && this.endDate) {
      this.checkAndSetActiveRange();
    }

    // Sync ngModel values for embedded time pickers (null when no time set)
    if (!this.dualCalendar) {
      this.singleTimeModel = this.startTime ?? null;
    } else {
      this.startTimeModel = this.startTime ?? null;
      this.endTimeModel = this.endTime ?? null;
    }
  }

  /** Format to "H:MM AM/PM" string. */
  private formatTimeToAmPm(hour12: number, minute: number, ampm: string): string {
    const m = minute.toString().padStart(2, '0');
    return `${hour12}:${m} ${ampm}`;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    // Don't handle click outside if inline mode is enabled
    if (this.inline) {
      return;
    }
    const target = event.target as HTMLElement;
    if (this.show && !target.closest('.calendar-container')) {
      this.close();
    }
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onWindowEvents() {
    if (this.show && this.appendToBody) {
      this.close();
      return;
    }
    if (this.show && !this.inline && !this.appendToBody) {
      setTimeout(() => this.refreshPopupPlacement(), 0);
    }
  }

  ngOnInit() {
    this.resolveCustomRangesFromInputsOrService();
    if (this.dualCalendar) this.initializeDual();
    else this.generateCalendar();

    // Initialize spinner state from existing dates (does not set startTime/endTime — those stay null until user picks time).
    if (this.startDate) {
      this.initializeTimeFromDate(this.startDate, true);
      if (!this.dualCalendar) {
        this.selectedHour = this.startHour;
        this.selectedMinute = this.startMinute;
        this.selectedAMPM = this.startAMPM;
      }
    }
    if (this.endDate) {
      this.initializeTimeFromDate(this.endDate, false);
    }

    // Check if current dates match any predefined range
    if (this.startDate && this.endDate) {
      this.checkAndSetActiveRange();
    }

    // If inline mode, always show calendar
    if (this.inline) {
      this.show = true;
      setTimeout(() => this.initKeyboardFocus(), 0);
    }

    // Register this calendar instance with the manager service
    this.closeFn = () => {
      if (this.show && !this.inline) {
        this.close();
      }
    };
    this.unregisterFn = this.calendarManager.register(this.closeFn);

    // Subscribe to close all events (skip if inline)
    this.closeAllSubscription = this.calendarManager.closeAll$.subscribe(() => {
      if (this.show && !this.inline) {
        this.close();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedValue']) {
      this.applyValueToState(this.selectedValue ?? null);
    }
    if (changes['customRanges'] || changes['rangeOrder']) {
      this.resolveCustomRangesFromInputsOrService();
    }
    if (changes['weekDayLabels'] && !changes['weekDayLabels'].firstChange) {
      this.regenerateCalendarsForWeekStart();
    }
  }

  private regenerateCalendarsForWeekStart(): void {
    if (this.dualCalendar) {
      this.generateDualCalendars();
    } else {
      this.generateCalendar();
    }
  }

  ngOnDestroy() {
    // Unregister this calendar instance
    if (this.unregisterFn) {
      this.unregisterFn();
    }

    // Unsubscribe from close all events
    if (this.closeAllSubscription) {
      this.closeAllSubscription.unsubscribe();
    }
  }

  checkAndSetActiveRange() {
    if (!this.customRanges || !this.startDate || !this.endDate) return;

    // Normalize dates for comparison (ignore time)
    const normalizeDate = (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const start = normalizeDate(this.startDate);
    const end = normalizeDate(this.endDate);

    // Check each range (except Custom Range)
    for (const key of this.rangeOrder) {
      if (key === 'Custom Range') continue;
      const range = this.customRanges![key];
      if (range) {
        const rangeStart = normalizeDate(range.start);
        const rangeEnd = normalizeDate(range.end);
        if (start.getTime() === rangeStart.getTime() && end.getTime() === rangeEnd.getTime()) {
          this.activeRange = key;
          return;
        }
      }
    }

    // If no match found, it's a custom range
    this.activeRange = 'Custom Range';
  }

  initializeTimeFromDate(date: Date, isStart: boolean) {
    // Always use 12-hour format
    const hours24 = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    if (isStart) {
      this.startMinute = minutes;
      this.startSecond = seconds;
      if (hours24 >= 12) {
        this.startAMPM = 'PM';
        this.startHour = hours24 > 12 ? hours24 - 12 : 12;
      } else {
        this.startAMPM = 'AM';
        this.startHour = hours24 === 0 ? 12 : hours24;
      }
    } else {
      this.endMinute = minutes;
      this.endSecond = seconds;
      if (hours24 >= 12) {
        this.endAMPM = 'PM';
        this.endHour = hours24 > 12 ? hours24 - 12 : 12;
      } else {
        this.endAMPM = 'AM';
        this.endHour = hours24 === 0 ? 12 : hours24;
      }
    }
  }

  toggle() {
    if (this.disabled) return;
    // Don't toggle if inline mode is enabled
    if (this.inline) {
      return;
    }
    const wasOpen = this.show;
    this.show = !this.show;

    if (this.show) {
      // If opening, close all other calendars first
      if (!wasOpen && this.closeFn) {
        this.calendarManager.closeAllExcept(this.closeFn);
      }
      this.disableHighlight = false;
      setTimeout(() => {
        this.initKeyboardFocus();
        this.calendarPopupRef?.nativeElement?.focus({ preventScroll: true });
        if (this.appendToBody && this.inputWrapper?.nativeElement) {
          this.updatePosition();
        } else if (!this.inline) {
          this.refreshPopupPlacement();
        }
      }, 0);
      this.opened.emit();
    } else {
      this.finishPopupDismissal();
    }
  }

  /** Update popup position when appendToBody is true (fixed positioning relative to viewport). */
  updatePosition() {
    if (!this.inputWrapper?.nativeElement) return;
    const rect = this.inputWrapper.nativeElement.getBoundingClientRect();
    const popupH = this.calendarPopupRef?.nativeElement?.offsetHeight ?? 360;
    const placeAbove = this.computePlacementAbove(rect, popupH);
    this.popupPlacementAbove = placeAbove;
    const gap = 4;
    if (placeAbove) {
      this.dropdownStyle = {
        bottom: `${window.innerHeight - rect.top + gap}px`,
        left: `${rect.left}px`,
      };
    } else {
      this.dropdownStyle = {
        top: `${rect.bottom + gap}px`,
        left: `${rect.left}px`,
      };
    }
  }

  /** Non–append-to-body: set `popupPlacementAbove` for CSS `drop-up` with viewport flip. */
  refreshPopupPlacement(): void {
    if (!this.inputWrapper?.nativeElement) return;
    const rect = this.inputWrapper.nativeElement.getBoundingClientRect();
    const popupH = this.calendarPopupRef?.nativeElement?.offsetHeight ?? 360;
    this.popupPlacementAbove = this.computePlacementAbove(rect, popupH);
  }

  private computePlacementAbove(rect: DOMRect, popupHeight: number): boolean {
    const gap = 12;
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const preferAbove = this.preferPopupAbove();
    if (preferAbove) {
      return spaceAbove >= popupHeight || spaceAbove >= spaceBelow;
    }
    if (spaceBelow >= popupHeight || spaceBelow >= spaceAbove) return false;
    return true;
  }

  /** Normalize to local midnight and clamp to min/max selectable day. */
  private clampCalendarDayToSelectableRange(d: Date): Date {
    let x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (this.minDate) {
      const min = new Date(this.minDate.getFullYear(), this.minDate.getMonth(), this.minDate.getDate());
      if (x < min) x = new Date(min.getFullYear(), min.getMonth(), min.getDate());
    }
    if (this.maxDate) {
      const max = new Date(this.maxDate.getFullYear(), this.maxDate.getMonth(), this.maxDate.getDate());
      if (x > max) x = new Date(max.getFullYear(), max.getMonth(), max.getDate());
    }
    return x;
  }

  private initKeyboardFocus(): void {
    if (!this.inline && !this.show) return;
    const base =
      this.startDate ??
      this.endDate ??
      new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
    const d = this.clampCalendarDayToSelectableRange(
      new Date(base.getFullYear(), base.getMonth(), base.getDate())
    );
    this.keyboardFocusDate = d;
    this.ensureKeyboardFocusVisible();
  }

  /**
   * After clearing values, drop stale keyboard highlight (was last start/end) and reset the
   * visible month(s) to today (clamped). Move DOM focus to the popup when open, else the input.
   */
  private resetCalendarFocusAfterClear(): void {
    const todayLocal = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
    this.keyboardFocusDate = this.clampCalendarDayToSelectableRange(todayLocal);

    if (this.dualCalendar) {
      this.leftMonth = this.keyboardFocusDate.getMonth();
      this.leftYear = this.keyboardFocusDate.getFullYear();
      this.rightMonth = this.leftMonth + 1;
      this.rightYear = this.leftYear;
      if (this.rightMonth > 11) {
        this.rightMonth = 0;
        this.rightYear++;
      }
      this.generateDualCalendars();
    } else {
      this.month = this.keyboardFocusDate.getMonth();
      this.year = this.keyboardFocusDate.getFullYear();
      this.generateCalendar();
    }

    this.scheduleDomFocusAfterClear();
  }

  private scheduleDomFocusAfterClear(): void {
    setTimeout(() => {
      if (this.show || this.inline) {
        this.calendarPopupRef?.nativeElement?.focus({ preventScroll: true });
        return;
      }
      const inputEl = this.inputWrapper?.nativeElement?.querySelector<HTMLInputElement>('.calendar-input');
      inputEl?.focus({ preventScroll: true });
    }, 0);
  }

  private ensureKeyboardFocusVisible(): void {
    if (!this.keyboardFocusDate) return;
    const fd = this.keyboardFocusDate;
    if (!this.dualCalendar) {
      if (fd.getMonth() !== this.month || fd.getFullYear() !== this.year) {
        this.month = fd.getMonth();
        this.year = fd.getFullYear();
        this.generateCalendar();
      }
      return;
    }
    const fm = fd.getMonth();
    const fy = fd.getFullYear();
    const inLeft = fm === this.leftMonth && fy === this.leftYear;
    const inRight = fm === this.rightMonth && fy === this.rightYear;
    if (inLeft || inRight) return;
    this.leftMonth = fm;
    this.leftYear = fy;
    this.rightMonth = fm + 1;
    this.rightYear = fy;
    if (this.rightMonth > 11) {
      this.rightMonth = 0;
      this.rightYear++;
    }
    this.generateDualCalendars();
  }

  private moveKeyboardFocus(deltaDays: number): void {
    if (!this.keyboardFocusDate) this.initKeyboardFocus();
    if (!this.keyboardFocusDate) return;
    let next = this.addDays(this.keyboardFocusDate, deltaDays);
    if (this.minDate) {
      const min = new Date(this.minDate.getFullYear(), this.minDate.getMonth(), this.minDate.getDate());
      if (next < min) next = min;
    }
    if (this.maxDate) {
      const max = new Date(this.maxDate.getFullYear(), this.maxDate.getMonth(), this.maxDate.getDate());
      if (next > max) next = max;
    }
    this.keyboardFocusDate = new Date(next.getFullYear(), next.getMonth(), next.getDate());
    this.ensureKeyboardFocusVisible();
  }

  /**
   * When focus is inside a real control (button, link, field), do not intercept keys here.
   * Otherwise this handler's preventDefault (Enter/Space) blocks native button activation and
   * bubbled Enter still runs applyKeyboardSelection — breaking keyboard parity with click.
   */
  private isKeyboardEventFromInteractiveDescendant(event: KeyboardEvent): boolean {
    const t = event.target;
    if (!(t instanceof Element)) return false;
    return !!t.closest(
      'button, a[href], input, select, textarea, [contenteditable="true"], bk-time-picker'
    );
  }

  onCalendarPopupKeydown(event: KeyboardEvent): void {
    if (this.disabled) return;
    if (event.key === 'Tab') return;
    if (this.isKeyboardEventFromInteractiveDescendant(event)) {
      return;
    }

    const k = event.key;
    if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowDown' || k === 'Enter' || k === ' ') {
      event.preventDefault();
    }
    if (k === 'ArrowLeft') this.moveKeyboardFocus(-1);
    else if (k === 'ArrowRight') this.moveKeyboardFocus(1);
    else if (k === 'ArrowUp') this.moveKeyboardFocus(-7);
    else if (k === 'ArrowDown') this.moveKeyboardFocus(7);
    else if (k === 'Enter' || k === ' ') this.applyKeyboardSelection();
  }

  private applyKeyboardSelection(): void {
    if (!this.keyboardFocusDate) return;
    const day = this.keyboardFocusDate.getDate();
    if (this.dualCalendar) {
      const fr = this.keyboardFocusDate.getMonth() === this.rightMonth && this.keyboardFocusDate.getFullYear() === this.rightYear;
      const fl = this.keyboardFocusDate.getMonth() === this.leftMonth && this.keyboardFocusDate.getFullYear() === this.leftYear;
      if (fr) this.selectDate(day, true);
      else if (fl) this.selectDate(day, false);
      else {
        this.ensureKeyboardFocusVisible();
        const fr2 = this.keyboardFocusDate.getMonth() === this.rightMonth && this.keyboardFocusDate.getFullYear() === this.rightYear;
        this.selectDate(day, fr2);
      }
    } else {
      this.selectDate(day, false);
    }
  }

  isKeyboardFocusedCell(year: number, month: number, day: number): boolean {
    if (!this.keyboardFocusDate || !day) return false;
    return (
      this.keyboardFocusDate.getFullYear() === year &&
      this.keyboardFocusDate.getMonth() === month &&
      this.keyboardFocusDate.getDate() === day
    );
  }

  onRangeButtonKeydown(event: KeyboardEvent, rangeKey: string): void {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      this.chooseRange(rangeKey);
    }
  }

  close() {
    if (this.inline) {
      return;
    }
    this.finishPopupDismissal();
  }

  onDateHover(day: number | null, fromRight = false) {
    if (!day || this.singleDatePicker || this.multiDateSelection) {
      this.hoveredDate = null;
      return;
    }

    // Only show hover preview if start date is selected but end date is not
    if (!this.startDate || this.endDate) {
      this.hoveredDate = null;
      return;
    }

    if (!this.dualCalendar) {
      this.hoveredDate = new Date(this.year, this.month, day);
    } else {
      this.hoveredDate = fromRight
        ? new Date(this.rightYear, this.rightMonth, day)
        : new Date(this.leftYear, this.leftMonth, day);
    }
  }

  onDateLeave() {
    this.hoveredDate = null;
  }

  selectDate(day: number | null, fromRight = false) {
    if (!day || this.disabled) return;

    let selected: Date;
    if (!this.dualCalendar) {
      selected = new Date(this.year, this.month, day);
    } else {
      selected = fromRight
        ? new Date(this.rightYear, this.rightMonth, day)
        : new Date(this.leftYear, this.leftMonth, day);
    }

    // Clear hover on selection
    this.hoveredDate = null;

    // Check min/max date constraints
    if (this.minDate && selected < this.minDate) return;
    if (this.maxDate && selected > this.maxDate) return;

    this.keyboardFocusDate = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());

    // Multi-date selection mode
    if (this.multiDateSelection) {
      this.handleMultiDateSelection(selected);
      return;
    }

    // Apply time only when user has already selected a time; otherwise keep time null (date at midnight)
    if (this.enableTimepicker) {
      if (this.dualCalendar) {
        const isStart = !this.startDate || !!this.endDate;
        if (isStart && this.startTime != null) this.applyTimeToDate(selected, true);
        else if (!isStart && this.endTime != null) this.applyTimeToDate(selected, false);
        else selected.setHours(0, 0, this.selectedSecond);
      } else {
        if (this.startTime != null) this.applyTimeToDate(selected, true);
        else selected.setHours(0, 0, this.selectedSecond);
      }
    }

    // Single date picker mode
    if (this.singleDatePicker) {
      this.startDate = selected;
      this.endDate = null;
      // Activate Custom Range when manually selecting dates
      this.activeRange = 'Custom Range';
      // Apply time only if user has already picked a time; otherwise keep time null
      if (this.enableTimepicker) {
        if (this.startTime != null) this.applyTimeToDate(this.startDate, true);
        else this.startDate.setHours(0, 0, this.selectedSecond);
      }
      if (this.autoApply) {
        this.apply();
        if (this.closeOnAutoApply && !this.inline) this.close();
      } else {
        this.emitSelectionUnlessSingleDateDeferred();
      }
      return;
    }

    // Range selection mode
    if (!this.startDate || this.endDate) {
      this.startDate = selected;
      this.endDate = null;
      // Activate Custom Range when manually selecting dates
      this.activeRange = 'Custom Range';
      // Keep left calendar on the selected month for better UX
      if (this.dualCalendar) {
        this.leftMonth = selected.getMonth();
        this.leftYear = selected.getFullYear();
        // Reset right calendar to original position (next month after left) when end date is cleared
        this.rightMonth = this.leftMonth + 1;
        this.rightYear = this.leftYear;
        if (this.rightMonth > 11) {
          this.rightMonth = 0;
          this.rightYear++;
        }
        this.generateDualCalendars();
      }
      // Don't overwrite time picker values - keep current values and apply them to the date
      // Time picker values are already set by user, we just apply them to the selected date
    } else {
      if (selected < this.startDate && !this.customRangeDirection) {
        this.endDate = this.startDate;
        this.startDate = selected;
        // Activate Custom Range when manually selecting dates
        this.activeRange = 'Custom Range';
        // Swap times if needed
        if (this.dualCalendar && this.enableTimepicker) {
          [this.startHour, this.endHour] = [this.endHour, this.startHour];
          [this.startMinute, this.endMinute] = [this.endMinute, this.startMinute];
          [this.startSecond, this.endSecond] = [this.endSecond, this.startSecond];
          [this.startAMPM, this.endAMPM] = [this.endAMPM, this.startAMPM];
        }
        // Keep left calendar on the selected month
        if (this.dualCalendar) {
          this.leftMonth = selected.getMonth();
          this.leftYear = selected.getFullYear();
          this.leftCalendar = this.buildCalendar(this.leftYear, this.leftMonth);
        }
      } else {
        this.endDate = selected;
        // Activate Custom Range when manually selecting dates
        this.activeRange = 'Custom Range';
        // Only move right calendar if end date is in a different month than start date
        if (this.dualCalendar) {
          if (this.startDate) {
            const startMonth = this.startDate.getMonth();
            const startYear = this.startDate.getFullYear();
            const endMonth = selected.getMonth();
            const endYear = selected.getFullYear();

            // Only move right calendar if end date is in a different month
            if (endMonth !== startMonth || endYear !== startYear) {
              this.rightMonth = endMonth;
              this.rightYear = endYear;
              this.rightCalendar = this.buildCalendar(this.rightYear, this.rightMonth);
            }
            // If both dates are in same month, keep right calendar in its current position
          } else {
            // If no start date, move right calendar to end date month
            this.rightMonth = selected.getMonth();
            this.rightYear = selected.getFullYear();
            this.rightCalendar = this.buildCalendar(this.rightYear, this.rightMonth);
          }
        }
        // Don't overwrite time picker values - keep current end time values
        // Time picker values are already set by user
      }
      if (this.autoApply) {
        this.apply();
        if (this.closeOnAutoApply && !this.inline) this.close();
      } else {
        // Check if the selection matches a predefined range
        this.checkAndSetActiveRange();
        // Always emit selection event for inline calendars
        if (this.inline) {
          this.emitSelection();
        }
      }
    }
  }

  handleMultiDateSelection(selected: Date) {
    const dateStr = this.getDateString(selected);
    const existingIndex = this.selectedDates.findIndex(d => this.getDateString(d) === dateStr);

    if (existingIndex >= 0) {
      // Deselect if already selected
      this.selectedDates.splice(existingIndex, 1);
    } else {
      // Add to selection
      this.selectedDates.push(new Date(selected));
      this.selectedDates.sort((a, b) => a.getTime() - b.getTime());
    }

    // Update startDate and endDate for compatibility
    if (this.selectedDates.length > 0) {
      this.startDate = new Date(this.selectedDates[0]);
      this.endDate = new Date(this.selectedDates[this.selectedDates.length - 1]);
      // Activate Custom Range when manually selecting dates
      this.activeRange = 'Custom Range';
    } else {
      this.startDate = null;
      this.endDate = null;
      this.activeRange = null;
    }

    // Always emit selection event for inline calendars or when autoApply is true
    if (this.autoApply || this.inline) {
      this.emitSelection();
      if (this.closeOnAutoApply && !this.inline) this.close();
    }
  }

  getDateString(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  isDateInMultiSelection(year: number, month: number, day: number): boolean {
    if (!this.multiDateSelection || this.selectedDates.length === 0) return false;
    const cellDate = new Date(year, month, day);
    return this.selectedDates.some(d => this.getDateString(d) === this.getDateString(cellDate));
  }

  apply() {
    if (this.disabled) return;
    if (this.isDualRangeApplyBlocked) return;
    // Format minute inputs to 2 digits before applying
    this.formatAllMinuteInputs();

    // Apply time only when the user has an explicit time string (avoids inventing "12:00 AM" from picker defaults).
    if (this.enableTimepicker) {
      if (this.dualCalendar) {
        if (this.startDate && this.startTime != null) {
          this.applyTimeToDate(this.startDate, true);
        }
        if (this.endDate && this.endTime != null) {
          this.applyTimeToDate(this.endDate, false);
        }
      } else {
        if (this.startDate && this.startTime != null) {
          this.applyTimeToDate(this.startDate, true);
        }
        if (this.endDate && !this.singleDatePicker && this.startTime != null) {
          this.applyTimeToDate(this.endDate, true);
        }
      }
    }

    // Check if the selection matches a predefined range
    this.checkAndSetActiveRange();

    this.emitSelection();
    this.disableHighlight = true;
    this.onTouched();
    this.close();
  }

  cancel() {
    if (this.disabled) return;
    if (this.shouldDeferSingleDateCommit()) {
      this.finishPopupDismissal();
      return;
    }
    this.startDate = null;
    this.endDate = null;
    this.selectedDates = [];
    this.resetCalendarFocusAfterClear();
    this.close();
  }

  clear() {
    if (this.disabled) return;
    this.startDate = null;
    this.endDate = null;
    this.startTime = null;
    this.endTime = null;
    this.selectedDates = [];
    this.activeRange = null;
    this.resetEmbeddedTimePickerUiState();

    this.resetCalendarFocusAfterClear();

    this.emitSelection();
  }

  chooseRange(key: string) {
    if (this.disabled || !this.customRanges) return;
    if (key === 'Custom Range') {
      this.activeRange = 'Custom Range';
      return;
    }
    const r = this.customRanges[key];
    if (!r) return;
    this.startDate = new Date(r.start);
    this.endDate = new Date(r.end);
    this.selectedDates = [];
    this.activeRange = key; // Set active range

    // Navigate calendars to show the selected date range
    if (this.dualCalendar) {
      // For dual calendar: left always shows start date month
      if (this.startDate) {
        this.leftMonth = this.startDate.getMonth();
        this.leftYear = this.startDate.getFullYear();
      }

      // Right calendar logic
      if (this.endDate && this.startDate) {
        const startMonth = this.startDate.getMonth();
        const startYear = this.startDate.getFullYear();
        const endMonth = this.endDate.getMonth();
        const endYear = this.endDate.getFullYear();

        // Only move right calendar if end date is in a different month than start date
        if (endMonth !== startMonth || endYear !== startYear) {
          this.rightMonth = endMonth;
          this.rightYear = endYear;
        } else {
          // If both dates are in same month, reset right calendar to default position (next month after left)
          this.rightMonth = this.leftMonth + 1;
          this.rightYear = this.leftYear;
          if (this.rightMonth > 11) {
            this.rightMonth = 0;
            this.rightYear++;
          }
        }
      } else if (this.endDate && !this.startDate) {
        // If only end date exists, show it in right calendar
        this.rightMonth = this.endDate.getMonth();
        this.rightYear = this.endDate.getFullYear();
      } else {
        // If no end date, reset right calendar to default position
        this.rightMonth = this.leftMonth + 1;
        this.rightYear = this.leftYear;
        if (this.rightMonth > 11) {
          this.rightMonth = 0;
          this.rightYear++;
        }
      }

      this.generateDualCalendars();
    } else {
      // For single calendar: show the start date month (or end date if only end date exists)
      if (this.startDate) {
        this.month = this.startDate.getMonth();
        this.year = this.startDate.getFullYear();
      } else if (this.endDate) {
        this.month = this.endDate.getMonth();
        this.year = this.endDate.getFullYear();
      }
      this.generateCalendar();
    }

    if (this.endDate) {
      this.keyboardFocusDate = new Date(this.endDate.getFullYear(), this.endDate.getMonth(), this.endDate.getDate());
    } else if (this.startDate) {
      this.keyboardFocusDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate());
    }

    this.emitSelectionUnlessSingleDateDeferred();
    if (this.shouldDeferSingleDateCommit()) {
      if (this.autoApply) {
        this.apply();
      }
    } else if (this.autoApply || this.closeOnAutoApply) {
      this.close();
    }
  }

  // emitSelection() {
  //   const selection: CalendarSelection = {
  //     startDate: this.startDate,
  //     endDate: this.endDate
  //   };
  //   if (this.multiDateSelection) {
  //     selection.selectedDates = [...this.selectedDates];
  //   }
  //   this.selected.emit(selection);
  // }

  emitSelection() {
    const hasValue =
      this.startDate != null ||
      this.endDate != null ||
      (this.multiDateSelection && this.selectedDates.length > 0);

    if (!hasValue) {
      this.selectedValue = null;
      this.onChange(null);
      this.selected.emit({
        startDate: null,
        endDate: null,
        startTime: null,
        endTime: null,
        selectedDates: [],
      });
      return;
    }

    const selection: CalendarSelection = {
      startDate: this.startDate ? this.formatDateToString(this.startDate) : null,
      endDate: this.endDate ? this.formatDateToString(this.endDate) : null,
      startTime: this.startTime ?? null,
      endTime: this.endTime ?? null,
    };

    if (this.multiDateSelection && this.selectedDates.length > 0) {
      selection.selectedDates = this.selectedDates.map((d) => this.formatDateToString(d));
    }

    this.selectedValue = selection;
    this.onChange(selection);
    this.selected.emit(selection);
  }

  addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  generateCalendar() {
    this.calendar = this.buildCalendar(this.year, this.month);
  }

  nextMonth() {
    if (!this.dualCalendar) {
      this.month++;
      if (this.month > 11) { this.month = 0; this.year++; }
      this.generateCalendar();
      return;
    }
    // For dual calendar, this should not be used - use nextLeftMonth or nextRightMonth instead
    this.nextLeftMonth();
  }

  prevMonth() {
    if (!this.dualCalendar) {
      this.month--;
      if (this.month < 0) { this.month = 11; this.year--; }
      this.generateCalendar();
      return;
    }
    // For dual calendar, this should not be used - use prevLeftMonth or prevRightMonth instead
    this.prevLeftMonth();
  }

  // Independent navigation for left calendar
  nextLeftMonth() {
    this.leftMonth++;
    if (this.leftMonth > 11) { this.leftMonth = 0; this.leftYear++; }
    this.leftCalendar = this.buildCalendar(this.leftYear, this.leftMonth);
  }

  prevLeftMonth() {
    this.leftMonth--;
    if (this.leftMonth < 0) { this.leftMonth = 11; this.leftYear--; }
    this.leftCalendar = this.buildCalendar(this.leftYear, this.leftMonth);
  }

  // Independent navigation for right calendar
  nextRightMonth() {
    this.rightMonth++;
    if (this.rightMonth > 11) { this.rightMonth = 0; this.rightYear++; }
    this.rightCalendar = this.buildCalendar(this.rightYear, this.rightMonth);
  }

  prevRightMonth() {
    this.rightMonth--;
    if (this.rightMonth < 0) { this.rightMonth = 11; this.rightYear--; }
    this.rightCalendar = this.buildCalendar(this.rightYear, this.rightMonth);
  }

  initializeDual() {
    this.leftMonth = this.today.getMonth();
    this.leftYear = this.today.getFullYear();
    // Initialize right calendar to next month, but they can move independently
    this.rightMonth = this.leftMonth + 1;
    this.rightYear = this.leftYear;
    if (this.rightMonth > 11) { this.rightMonth = 0; this.rightYear++; }
    this.generateDualCalendars();
  }

  generateDualCalendars() {
    this.leftCalendar = this.buildCalendar(this.leftYear, this.leftMonth);
    this.rightCalendar = this.buildCalendar(this.rightYear, this.rightMonth);
  }

  buildCalendar(year: number, month: number): { day: number, currentMonth: boolean }[][] {
    const weekStart = this.getWeekStartDayIndex();
    const firstDayJs = new Date(year, month, 1).getDay();
    const offset = (firstDayJs - weekStart + 7) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const grid: { day: number, currentMonth: boolean }[][] = [];
    let row: { day: number, currentMonth: boolean }[] = [];

    for (let i = offset - 1; i >= 0; i--) {
      row.push({ day: prevMonthDays - i, currentMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      row.push({ day: d, currentMonth: true });
      if (row.length === 7) { grid.push(row); row = []; }
    }
    let nextMonthDay = 1;
    while (row.length > 0 && row.length < 7) {
      row.push({ day: nextMonthDay++, currentMonth: false });
    }
    if (row.length) grid.push(row);

    // Ensure we always have 6 rows (42 cells total) for consistent layout
    while (grid.length < 6) {
      const newRow: { day: number, currentMonth: boolean }[] = [];
      for (let i = 0; i < 7; i++) {
        newRow.push({ day: nextMonthDay++, currentMonth: false });
      }
      grid.push(newRow);
    }

    return grid;
  }

  isDateSelected(year: number, month: number, day: number): boolean {
    if (this.disableHighlight) return false;
    if (!day) return false;

    // Multi-date selection
    if (this.multiDateSelection) {
      return this.isDateInMultiSelection(year, month, day);
    }

    const cellDate = new Date(year, month, day);

    // Check if it's today (highlight today by default if no date selected)
    const today = new Date();
    const isToday = cellDate.getFullYear() === today.getFullYear() &&
                    cellDate.getMonth() === today.getMonth() &&
                    cellDate.getDate() === today.getDate();

    // If no startDate is set and it's today, highlight it
    if (!this.startDate && isToday) {
      return true;
    }

    if (!this.startDate) return false;

    // Check if date is disabled
    if (this.minDate && cellDate < this.minDate) return false;
    if (this.maxDate && cellDate > this.maxDate) return false;

    const sameDay =
      cellDate.getFullYear() === this.startDate.getFullYear() &&
      cellDate.getMonth() === this.startDate.getMonth() &&
      cellDate.getDate() === this.startDate.getDate();

    if (this.singleDatePicker) return sameDay;

    // For range selection: only highlight start and end dates (not in-between)
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate());
      const end = new Date(this.endDate.getFullYear(), this.endDate.getMonth(), this.endDate.getDate());
      return cellDate.getTime() === start.getTime() || cellDate.getTime() === end.getTime();
    }

    // If only start date is selected and hovering, check if this is start or hovered end
    if (this.startDate && !this.endDate && this.hoveredDate) {
      const start = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate());
      const hovered = new Date(this.hoveredDate.getFullYear(), this.hoveredDate.getMonth(), this.hoveredDate.getDate());
      // Show both start and hovered date as selected (circular black)
      return cellDate.getTime() === start.getTime() || cellDate.getTime() === hovered.getTime();
    }

    return sameDay;
  }

  isDateInRange(year: number, month: number, day: number): boolean {
    if (this.disableHighlight || !day) return false;
    if (this.singleDatePicker) return false;
    if (this.multiDateSelection) return false;

    const cellDate = new Date(year, month, day);

    // If both start and end are selected, show gray background for dates in between
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate());
      const end = new Date(this.endDate.getFullYear(), this.endDate.getMonth(), this.endDate.getDate());
      return cellDate > start && cellDate < end;
    }

    // If only start is selected and hovering, show preview range
    if (this.startDate && !this.endDate && this.hoveredDate) {
      const start = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate());
      const hovered = new Date(this.hoveredDate.getFullYear(), this.hoveredDate.getMonth(), this.hoveredDate.getDate());

      // Determine which is earlier - show gray background for dates between them
      const minDate = hovered < start ? hovered : start;
      const maxDate = hovered >= start ? hovered : start;
      return cellDate > minDate && cellDate < maxDate;
    }

    return false;
  }

  isDateDisabled(year: number, month: number, day: number): boolean {
    if (!day) return false;
    const cellDate = new Date(year, month, day);
    if (this.minDate && cellDate < this.minDate) return true;
    if (this.maxDate && cellDate > this.maxDate) return true;
    return false;
  }

  isToday(year: number, month: number, day: number): boolean {
    if (!day) return false;
    const today = new Date();
    const cellDate = new Date(year, month, day);
    return cellDate.getFullYear() === today.getFullYear() &&
           cellDate.getMonth() === today.getMonth() &&
           cellDate.getDate() === today.getDate();
  }

  getDisplayValue(): string {
    if (this.multiDateSelection && this.selectedDates.length > 0) {
      if (this.selectedDates.length === 1) {
        return moment(this.selectedDates[0]).format(this.displayFormat);
      }
      return `${this.selectedDates.length} dates selected`;
    }

    if (!this.startDate) return '';

    // Prefer moment formatting for consistent display
    let dateStr = moment(this.startDate).format(this.displayFormat);

    // Only show time when user has selected a time; use startTime/endTime strings so 12:00 AM shows as "12:00 AM" not "00:00"
    if (this.enableTimepicker && !this.dualCalendar && this.startTime != null) {
      dateStr += ` ${this.startTime}`;
    }

    if (this.endDate && !this.singleDatePicker) {
      let endStr = moment(this.endDate).format(this.displayFormat);
      if (this.enableTimepicker) {
        if (this.dualCalendar && this.startTime != null) {
          dateStr += ` ${this.startTime}`;
        }
        if (this.endTime != null) {
          endStr += ` ${this.endTime}`;
        }
      }
      return `${dateStr} - ${endStr}`;
    }
    return dateStr;
  }

  // Time picker helpers
  getTimeInputValue(isStart = true): string {
    const h = isStart ? this.startHour : this.endHour;
    const m = isStart ? this.startMinute : this.endMinute;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  getSingleTimeInputValue(): string {
    return `${this.selectedHour.toString().padStart(2, '0')}:${this.selectedMinute.toString().padStart(2, '0')}`;
  }

  // NEW: Helper to build display value for BkTimePicker (single calendar)
  getSingleTimePickerDisplay(): string {
    const hour = this.selectedHour || 12;
    const minuteStr = this.selectedMinute.toString().padStart(2, '0');
    const ampm = this.selectedAMPM || 'AM';
    return `${hour}:${minuteStr} ${ampm}`;
  }

  // NEW: Helper to build display value for BkTimePicker (dual calendar)
  getDualTimePickerDisplay(isStart = true): string {
    const hour = isStart ? (this.startHour || 12) : (this.endHour || 12);
    const minute = isStart ? this.startMinute : this.endMinute;
    const ampm = isStart ? (this.startAMPM || 'AM') : (this.endAMPM || 'AM');
    const minuteStr = minute.toString().padStart(2, '0');
    return `${hour}:${minuteStr} ${ampm}`;
  }

  // Coordination helpers for embedded BkTimePicker instances
  onTimePickerOpened(pickerId: string) {
    // Close previously open picker inside this calendar
    if (this.openTimePickerId && this.openTimePickerId !== pickerId) {
      if (!this.closePickerCounter[this.openTimePickerId]) {
        this.closePickerCounter[this.openTimePickerId] = 0;
      }
      this.closePickerCounter[this.openTimePickerId]++;
    }
    this.openTimePickerId = pickerId;
  }

  onTimePickerClosed(pickerId: string) {
    if (this.openTimePickerId === pickerId) {
      this.openTimePickerId = null;
    }
  }

  shouldClosePicker(pickerId: string): number {
    return this.closePickerCounter[pickerId] || 0;
  }

  // NEW: Parse "H:MM AM/PM" (or "HH:MM" 24h) from BkTimePicker
  private parsePickerTimeString(timeStr: string): { hour12: number; minute: number; ampm: 'AM' | 'PM' } {
    if (!timeStr) {
      return { hour12: 12, minute: 0, ampm: 'AM' };
    }

    const parts = timeStr.trim().split(' ');
    const timePart = parts[0] || '12:00';
    let ampmPart = (parts[1] || '').toUpperCase();

    const [hourStr, minuteStr] = timePart.split(':');
    let hour = parseInt(hourStr || '12', 10);
    const minute = parseInt(minuteStr || '0', 10);

    if (ampmPart !== 'AM' && ampmPart !== 'PM') {
      // Interpret as 24-hour input and convert
      if (hour >= 12) {
        ampmPart = 'PM';
        if (hour > 12) hour -= 12;
      } else {
        ampmPart = 'AM';
        if (hour === 0) hour = 12;
      }
    }

    // Clamp to 1-12 range just in case
    if (hour < 1) hour = 1;
    if (hour > 12) hour = 12;

    return { hour12: hour, minute, ampm: ampmPart as 'AM' | 'PM' };
  }

  // NEW: Handle BkTimePicker change for single calendar
  onSingleTimePickerChange(time: string | null) {
    if (time == null || time === '') {
      this.startTime = null;
      this.selectedHour = 1;
      this.selectedMinute = 0;
      this.selectedAMPM = 'AM';
      if (this.startDate) {
        this.startDate.setHours(0, 0, this.selectedSecond);
      }
      this.emitSelectionUnlessSingleDateDeferred();
      return;
    }
    const { hour12, minute, ampm } = this.parsePickerTimeString(time);

    this.selectedHour = hour12;
    this.selectedMinute = minute;
    this.selectedAMPM = ampm;

    const timeStr = this.formatTimeToAmPm(hour12, minute, ampm);
    this.startTime = timeStr;

    if (this.startDate) {
      let h24 = hour12;
      if (ampm === 'PM' && h24 < 12) h24 += 12;
      if (ampm === 'AM' && h24 === 12) h24 = 0;
      this.startDate.setHours(h24, minute, this.selectedSecond);
    }

    this.emitSelectionUnlessSingleDateDeferred();
  }

  // NEW: Handle BkTimePicker change for dual calendar
  onDualTimePickerChange(time: string | null, isStart = true) {
    if (time == null || time === '') {
      if (isStart) {
        this.startTime = null;
        this.startHour = 1;
        this.startMinute = 0;
        this.startAMPM = 'AM';
        if (this.startDate) this.startDate.setHours(0, 0, this.startSecond);
      } else {
        this.endTime = null;
        this.endHour = 2;
        this.endMinute = 0;
        this.endAMPM = 'AM';
        if (this.endDate) this.endDate.setHours(0, 0, this.endSecond);
      }
      this.emitSelection();
      return;
    }
    const { hour12, minute, ampm } = this.parsePickerTimeString(time);
    const timeStr = this.formatTimeToAmPm(hour12, minute, ampm);

    if (isStart) {
      this.startHour = hour12;
      this.startMinute = minute;
      this.startAMPM = ampm;
      this.startTime = timeStr;

      if (this.startDate) {
        let h24 = hour12;
        if (ampm === 'PM' && h24 < 12) h24 += 12;
        if (ampm === 'AM' && h24 === 12) h24 = 0;
        this.startDate.setHours(h24, minute, this.startSecond);
      }
    } else {
      this.endHour = hour12;
      this.endMinute = minute;
      this.endAMPM = ampm;
      this.endTime = timeStr;

      if (this.endDate) {
        let h24 = hour12;
        if (ampm === 'PM' && h24 < 12) h24 += 12;
        if (ampm === 'AM' && h24 === 12) h24 = 0;
        this.endDate.setHours(h24, minute, this.endSecond);
      }
    }

    this.emitSelection();
  }

  onTimeChange(event: any, isStart = true) {
    const [h, m] = event.target.value.split(':').map(Number);
    if (isStart) {
      this.startHour = h;
      this.startMinute = m;
      if (this.startDate) {
        this.startDate.setHours(h, m, this.startSecond);
        this.emitSelection();
      }
    } else {
      this.endHour = h;
      this.endMinute = m;
      if (this.endDate) {
        this.endDate.setHours(h, m, this.endSecond);
        this.emitSelection();
      }
    }
  }

  onSingleTimeChange(event: any) {
    const [h, m] = event.target.value.split(':').map(Number);
    this.selectedHour = h;
    this.selectedMinute = m;
    if (this.startDate) {
      this.startDate.setHours(h, m, this.selectedSecond);
      this.emitSelectionUnlessSingleDateDeferred();
    }
  }

  // Custom time picker controls
  incrementHour(isStart = true) {
    // 12-hour format: 1-12
    if (isStart) {
      this.startHour = this.startHour >= 12 ? 1 : this.startHour + 1;
      // Toggle AM/PM at 12
      if (this.startHour === 12) {
        this.startAMPM = this.startAMPM === 'AM' ? 'PM' : 'AM';
      }
      if (this.startDate) {
        let h = this.startHour;
        if (this.startAMPM === 'PM' && h < 12) h += 12;
        if (this.startAMPM === 'AM' && h === 12) h = 0;
        this.startDate.setHours(h, this.startMinute, this.startSecond);
      }
    } else {
      this.endHour = this.endHour >= 12 ? 1 : this.endHour + 1;
      // Toggle AM/PM at 12
      if (this.endHour === 12) {
        this.endAMPM = this.endAMPM === 'AM' ? 'PM' : 'AM';
      }
      if (this.endDate) {
        let h = this.endHour;
        if (this.endAMPM === 'PM' && h < 12) h += 12;
        if (this.endAMPM === 'AM' && h === 12) h = 0;
        this.endDate.setHours(h, this.endMinute, this.endSecond);
      }
    }
    this.emitSelection();
  }

  decrementHour(isStart = true) {
    // 12-hour format: 1-12
    if (isStart) {
      this.startHour = this.startHour <= 1 ? 12 : this.startHour - 1;
      // Toggle AM/PM at 12
      if (this.startHour === 12) {
        this.startAMPM = this.startAMPM === 'AM' ? 'PM' : 'AM';
      }
      if (this.startDate) {
        let h = this.startHour;
        if (this.startAMPM === 'PM' && h < 12) h += 12;
        if (this.startAMPM === 'AM' && h === 12) h = 0;
        this.startDate.setHours(h, this.startMinute, this.startSecond);
      }
    } else {
      this.endHour = this.endHour <= 1 ? 12 : this.endHour - 1;
      // Toggle AM/PM at 12
      if (this.endHour === 12) {
        this.endAMPM = this.endAMPM === 'AM' ? 'PM' : 'AM';
      }
      if (this.endDate) {
        let h = this.endHour;
        if (this.endAMPM === 'PM' && h < 12) h += 12;
        if (this.endAMPM === 'AM' && h === 12) h = 0;
        this.endDate.setHours(h, this.endMinute, this.endSecond);
      }
    }
    this.emitSelection();
  }

  incrementMinute(isStart = true) {
    if (isStart) {
      this.startMinute = (this.startMinute + 1) % 60;
      if (this.startDate) {
        let h = this.startHour;
        if (this.startAMPM === 'PM' && h < 12) h += 12;
        if (this.startAMPM === 'AM' && h === 12) h = 0;
        this.startDate.setHours(h, this.startMinute, this.startSecond);
      }
    } else {
      this.endMinute = (this.endMinute + 1) % 60;
      if (this.endDate) {
        let h = this.endHour;
        if (this.endAMPM === 'PM' && h < 12) h += 12;
        if (this.endAMPM === 'AM' && h === 12) h = 0;
        this.endDate.setHours(h, this.endMinute, this.endSecond);
      }
    }
    this.emitSelection();
  }

  decrementMinute(isStart = true) {
    if (isStart) {
      this.startMinute = this.startMinute <= 0 ? 59 : this.startMinute - 1;
      if (this.startDate) {
        let h = this.startHour;
        if (this.startAMPM === 'PM' && h < 12) h += 12;
        if (this.startAMPM === 'AM' && h === 12) h = 0;
        this.startDate.setHours(h, this.startMinute, this.startSecond);
      }
    } else {
      this.endMinute = this.endMinute <= 0 ? 59 : this.endMinute - 1;
      if (this.endDate) {
        let h = this.endHour;
        if (this.endAMPM === 'PM' && h < 12) h += 12;
        if (this.endAMPM === 'AM' && h === 12) h = 0;
        this.endDate.setHours(h, this.endMinute, this.endSecond);
      }
    }
    this.emitSelection();
  }

  toggleAMPM(isStart = true) {
    if (isStart) {
      this.startAMPM = this.startAMPM === 'AM' ? 'PM' : 'AM';
      if (this.startDate) {
        let h = this.startHour;
        if (this.startAMPM === 'PM' && h < 12) h += 12;
        if (this.startAMPM === 'AM' && h === 12) h = 0;
        this.startDate.setHours(h, this.startMinute, this.startSecond);
      }
    } else {
      this.endAMPM = this.endAMPM === 'AM' ? 'PM' : 'AM';
      if (this.endDate) {
        let h = this.endHour;
        if (this.endAMPM === 'PM' && h < 12) h += 12;
        if (this.endAMPM === 'AM' && h === 12) h = 0;
        this.endDate.setHours(h, this.endMinute, this.endSecond);
      }
    }
    this.emitSelection();
  }

  // Single calendar time picker controls (12-hour format: 1-12)
  incrementSingleHour() {
    this.selectedHour = this.selectedHour >= 12 ? 1 : this.selectedHour + 1;
    // Toggle AM/PM at 12
    if (this.selectedHour === 12) {
      this.selectedAMPM = this.selectedAMPM === 'AM' ? 'PM' : 'AM';
    }
    if (this.startDate) {
      let h = this.selectedHour;
      if (this.selectedAMPM === 'PM' && h < 12) h += 12;
      if (this.selectedAMPM === 'AM' && h === 12) h = 0;
      this.startDate.setHours(h, this.selectedMinute, this.selectedSecond);
      this.emitSelectionUnlessSingleDateDeferred();
    }
  }

  decrementSingleHour() {
    this.selectedHour = this.selectedHour <= 1 ? 12 : this.selectedHour - 1;
    // Toggle AM/PM at 12
    if (this.selectedHour === 12) {
      this.selectedAMPM = this.selectedAMPM === 'AM' ? 'PM' : 'AM';
    }
    if (this.startDate) {
      let h = this.selectedHour;
      if (this.selectedAMPM === 'PM' && h < 12) h += 12;
      if (this.selectedAMPM === 'AM' && h === 12) h = 0;
      this.startDate.setHours(h, this.selectedMinute, this.selectedSecond);
      this.emitSelectionUnlessSingleDateDeferred();
    }
  }

  incrementSingleMinute() {
    this.selectedMinute = (this.selectedMinute + 1) % 60;
    if (this.startDate) {
      let h = this.selectedHour;
      if (this.selectedAMPM === 'PM' && h < 12) h += 12;
      if (this.selectedAMPM === 'AM' && h === 12) h = 0;
      this.startDate.setHours(h, this.selectedMinute, this.selectedSecond);
      this.emitSelectionUnlessSingleDateDeferred();
    }
  }

  decrementSingleMinute() {
    this.selectedMinute = this.selectedMinute <= 0 ? 59 : this.selectedMinute - 1;
    if (this.startDate) {
      let h = this.selectedHour;
      if (this.selectedAMPM === 'PM' && h < 12) h += 12;
      if (this.selectedAMPM === 'AM' && h === 12) h = 0;
      this.startDate.setHours(h, this.selectedMinute, this.selectedSecond);
      this.emitSelectionUnlessSingleDateDeferred();
    }
  }

  toggleSingleAMPM() {
    this.selectedAMPM = this.selectedAMPM === 'AM' ? 'PM' : 'AM';
    if (this.startDate) {
      let h = this.selectedHour;
      if (this.selectedAMPM === 'PM' && h < 12) h += 12;
      if (this.selectedAMPM === 'AM' && h === 12) h = 0;
      this.startDate.setHours(h, this.selectedMinute, this.selectedSecond);
      this.emitSelectionUnlessSingleDateDeferred();
    }
  }

  getMonthName(month: number): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month];
  }

  // Input handlers for direct hour/minute input (12-hour format only)
  onHourInput(event: any, isStart = true, isSingle = false): void {
    const inputValue = event.target.value;

    // Allow empty input while typing
    if (inputValue === '' || inputValue === null || inputValue === undefined) {
      return;
    }

    let value = parseInt(inputValue) || 0;

    // Validate: 1-12 for 12-hour format
    if (value < 1) value = 1;
    if (value > 12) value = 12;

    if (isSingle) {
      this.selectedHour = value;
      if (this.startDate) {
        let h = value;
        if (this.selectedAMPM === 'PM' && h < 12) h += 12;
        if (this.selectedAMPM === 'AM' && h === 12) h = 0;
        this.startDate.setHours(h, this.selectedMinute, this.selectedSecond);
        this.emitSelectionUnlessSingleDateDeferred();
      }
    } else if (isStart) {
      this.startHour = value;
      if (this.startDate) {
        let h = value;
        if (this.startAMPM === 'PM' && h < 12) h += 12;
        if (this.startAMPM === 'AM' && h === 12) h = 0;
        this.startDate.setHours(h, this.startMinute, this.startSecond);
        this.emitSelection();
      }
    } else {
      this.endHour = value;
      if (this.endDate) {
        let h = value;
        if (this.endAMPM === 'PM' && h < 12) h += 12;
        if (this.endAMPM === 'AM' && h === 12) h = 0;
        this.endDate.setHours(h, this.endMinute, this.endSecond);
        this.emitSelection();
      }
    }

    // Don't format during input, only on blur
    event.target.value = value.toString();
  }

  onHourBlur(event: any, isStart = true, isSingle = false): void {
    const inputValue = event.target.value;
    if (inputValue === '' || inputValue === null || inputValue === undefined) {
      // If empty, set to current value
      const currentValue = isSingle ? this.selectedHour : (isStart ? this.startHour : this.endHour);
      event.target.value = currentValue.toString();
      return;
    }

    let value = parseInt(inputValue) || 0;
    if (value < 1) value = 1;
    if (value > 12) value = 12;

    // Format to single digit (no padding for hours in 12-hour format)
    event.target.value = value.toString();

    // Update the value
    if (isSingle) {
      this.selectedHour = value;
      if (this.startDate) {
        let h = value;
        if (this.selectedAMPM === 'PM' && h < 12) h += 12;
        if (this.selectedAMPM === 'AM' && h === 12) h = 0;
        this.startDate.setHours(h, this.selectedMinute, this.selectedSecond);
        this.emitSelectionUnlessSingleDateDeferred();
      }
    } else if (isStart) {
      this.startHour = value;
      if (this.startDate) {
        let h = value;
        if (this.startAMPM === 'PM' && h < 12) h += 12;
        if (this.startAMPM === 'AM' && h === 12) h = 0;
        this.startDate.setHours(h, this.startMinute, this.startSecond);
        this.emitSelection();
      }
    } else {
      this.endHour = value;
      if (this.endDate) {
        let h = value;
        if (this.endAMPM === 'PM' && h < 12) h += 12;
        if (this.endAMPM === 'AM' && h === 12) h = 0;
        this.endDate.setHours(h, this.endMinute, this.endSecond);
        this.emitSelection();
      }
    }
  }

  onMinuteInput(event: any, isStart = true, isSingle = false): void {
    const inputValue = event.target.value;
    const key = `${isStart ? 'start' : 'end'}_${isSingle ? 'single' : 'dual'}`;

    // Remove any non-digit characters
    const digitsOnly = inputValue.replace(/\D/g, '');

    // Store raw input value for display
    this.minuteInputValues[key] = digitsOnly;

    // Allow empty input while typing
    if (digitsOnly === '' || digitsOnly === null || digitsOnly === undefined) {
      return; // Don't modify the input, let user clear it
    }

    // Allow typing up to 2 digits without formatting
    let value = parseInt(digitsOnly) || 0;

    // If user types more than 2 digits, take only first 2
    if (digitsOnly.length > 2) {
      value = parseInt(digitsOnly.substring(0, 2));
      this.minuteInputValues[key] = digitsOnly.substring(0, 2);
      event.target.value = digitsOnly.substring(0, 2);
    }

    // If value exceeds 59, clamp it to 59
    if (value > 59) {
      value = 59;
      this.minuteInputValues[key] = '59';
      event.target.value = '59';
    }

    // Update the internal value silently (don't emit during typing to avoid re-rendering)
    if (isSingle) {
      this.selectedMinute = value;
    } else if (isStart) {
      this.startMinute = value;
    } else {
      this.endMinute = value;
    }

    // Don't update dates or emit during typing - wait for blur or apply
  }

  onMinuteBlur(event: any, isStart = true, isSingle = false): void {
    const key = `${isStart ? 'start' : 'end'}_${isSingle ? 'single' : 'dual'}`;
    const inputValue = event.target.value;

    if (inputValue === '' || inputValue === null || inputValue === undefined) {
      // If empty, set to current value
      const currentValue = isSingle ? this.selectedMinute : (isStart ? this.startMinute : this.endMinute);
      event.target.value = currentValue.toString().padStart(2, '0');
      delete this.minuteInputValues[key];
      return;
    }

    const digitsOnly = inputValue.replace(/\D/g, '');
    let value = parseInt(digitsOnly) || 0;
    if (value < 0) value = 0;
    if (value > 59) value = 59;

    // Format to 2 digits on blur (01-09 becomes 01-09, 10-59 stays as is)
    event.target.value = value.toString().padStart(2, '0');
    delete this.minuteInputValues[key]; // Clear raw input, use formatted value

    // Update the value
    if (isSingle) {
      this.selectedMinute = value;
      if (this.startDate) {
        let h = this.selectedHour;
        if (this.selectedAMPM === 'PM' && h < 12) h += 12;
        if (this.selectedAMPM === 'AM' && h === 12) h = 0;
        this.startDate.setHours(h, this.selectedMinute, this.selectedSecond);
        this.emitSelectionUnlessSingleDateDeferred();
      }
    } else if (isStart) {
      this.startMinute = value;
      if (this.startDate) {
        let h = this.startHour;
        if (this.startAMPM === 'PM' && h < 12) h += 12;
        if (this.startAMPM === 'AM' && h === 12) h = 0;
        this.startDate.setHours(h, this.startMinute, this.startSecond);
        this.emitSelection();
      }
    } else {
      this.endMinute = value;
      if (this.endDate) {
        let h = this.endHour;
        if (this.endAMPM === 'PM' && h < 12) h += 12;
        if (this.endAMPM === 'AM' && h === 12) h = 0;
        this.endDate.setHours(h, this.endMinute, this.endSecond);
        this.emitSelection();
      }
    }
  }

  // Get display value for hour (always 12-hour format)
  getDisplayHour(hour: number): number {
    if (hour === 0) return 12;
    if (hour > 12) return hour - 12;
    return hour;
  }

  // Get display value for minute (formatted only when not actively typing)
  getMinuteDisplayValue(isStart: boolean, isSingle: boolean): string {
    const key = `${isStart ? 'start' : 'end'}_${isSingle ? 'single' : 'dual'}`;
    // If user is typing (has raw input), show that, otherwise show formatted value
    if (this.minuteInputValues[key] !== undefined) {
      return this.minuteInputValues[key];
    }
    // Otherwise return formatted value
    const value = isSingle ? this.selectedMinute : (isStart ? this.startMinute : this.endMinute);
    return value.toString().padStart(2, '0');
  }

  // Helper method to apply time picker values to a date
  applyTimeToDate(date: Date, isStart: boolean): void {
    if (this.dualCalendar) {
      if (isStart) {
        let h = this.startHour;
        if (this.startAMPM === 'PM' && h < 12) h += 12;
        if (this.startAMPM === 'AM' && h === 12) h = 0;
        date.setHours(h, this.startMinute, this.startSecond);
      } else {
        let h = this.endHour;
        if (this.endAMPM === 'PM' && h < 12) h += 12;
        if (this.endAMPM === 'AM' && h === 12) h = 0;
        date.setHours(h, this.endMinute, this.endSecond);
      }
    } else {
      let h = this.selectedHour;
      if (this.selectedAMPM === 'PM' && h < 12) h += 12;
      if (this.selectedAMPM === 'AM' && h === 12) h = 0;
      date.setHours(h, this.selectedMinute, this.selectedSecond);
    }
  }

  // Select all text on focus for easy replacement
  onTimeInputFocus(event: any): void {
    event.target.select();
  }

  // Format all minute inputs to 2 digits (called before Apply)
  formatAllMinuteInputs(): void {
    // Format minute inputs in the DOM - find all minute inputs and format single digits
    const inputs = document.querySelectorAll('.time-input');
    inputs.forEach((input: any) => {
      const value = parseInt(input.value);
      // If it's a valid minute value (0-59) and not already formatted (single digit or 2 digits without leading zero)
      if (!isNaN(value) && value >= 0 && value <= 59) {
        // Format if it's a single digit (1-9) or if it's 2 digits but the first is not 0
        if (input.value.length === 1 || (input.value.length === 2 && !input.value.startsWith('0') && value < 10)) {
          input.value = value.toString().padStart(2, '0');
        }
      }
    });
  }

  /**
   * Parse a date-only string (YYYY-MM-DD) as local date.
   * Using new Date('2026-02-21') would be UTC midnight and can show as previous day in local time.
   */
  private parseDateString(value: string): Date {
    if (!value || typeof value !== 'string') return new Date(value);
    const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const y = parseInt(match[1], 10);
      const m = parseInt(match[2], 10) - 1;
      const d = parseInt(match[3], 10);
      if (m >= 0 && m <= 11 && d >= 1 && d <= 31) {
        return new Date(y, m, d);
      }
    }
    return new Date(value);
  }

  formatDateToString(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0'); // month is 0-based
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
