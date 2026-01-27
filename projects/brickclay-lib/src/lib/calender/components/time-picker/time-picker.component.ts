import { BrickclayIcons } from '../../../assets/icons';
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, AfterViewInit, QueryList, ViewChildren, ElementRef, HostListener, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'brickclay-time-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.css']
})
export class TimePickerComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() value: string = '1:00 AM'; // Time in format "H:MM AM/PM"
  @Input() label: string = 'Time';
  @Input() placeholder: string = 'Select time';
  @Input() position: 'left' | 'right' = 'left';
  @Input() pickerId: string = ''; // Unique ID for this picker
  @Input() closePicker: number = 0; // Close counter from parent (triggers close when changed)
  @Input() timeFormat: 12 | 24 = 12; // Visual mode: 12h or 24h
  @Input() showSeconds = false; // Whether to show/edit seconds
  @Output() timeChange = new EventEmitter<string>();
  @Output() pickerOpened = new EventEmitter<string>(); // Notify parent when opened
  @Output() pickerClosed = new EventEmitter<string>(); // Notify parent when closed

  @ViewChildren('timeScroll') timeScrollElements!: QueryList<ElementRef>;

  showPicker = false;
  currentHour = 1;
  currentMinute = 0;
  currentAMPM = 'AM';
  currentSecond = 0;

  brickclayIcons=BrickclayIcons;

  ngOnInit() {
    this.parseTimeValue();
  }

  ngAfterViewInit() {
    if (this.showPicker) {
      setTimeout(() => {
        this.scrollToSelectedTimes();
      }, 100);
    }
  }

  parseTimeValue() {
    const parsed = this.parseTimeStringToComponents(this.value);
    this.currentHour = parsed.hour;
    this.currentMinute = parsed.minute;
    this.currentSecond = parsed.second;
    this.currentAMPM = parsed.ampm;
  }

  getHours(): number[] {
    // 12-hour: 1-12, 24-hour: 0-23
    if (this.timeFormat === 24) {
      return Array.from({ length: 24 }, (_, i) => i);
    }
    return Array.from({ length: 12 }, (_, i) => i + 1);
  }

  getMinutes(): number[] {
    return Array.from({ length: 60 }, (_, i) => i);
  }

  getSeconds(): number[] {
    return Array.from({ length: 60 }, (_, i) => i);
  }

  getAMPMOptions(): string[] {
    return ['AM', 'PM'];
  }

  parseTimeStringToComponents(timeStr: string): { hour: number; minute: number; second: number; ampm: string } {
    // Supports:
    // - "H:MM AM/PM"
    // - "H:MM:SS AM/PM"
    // - "HH:MM" (24h)
    // - "HH:MM:SS" (24h)
    if (!timeStr) {
      return {
        hour: this.timeFormat === 24 ? 0 : 12,
        minute: 0,
        second: 0,
        ampm: this.timeFormat === 24 ? '' : 'AM'
      };
    }

    const parts = timeStr.trim().split(' ');
    const timePart = parts[0] || (this.timeFormat === 24 ? '00:00' : '12:00');
    let ampm = (parts[1] || '').toUpperCase();

    const [hoursStr, minutesStr, secondsStr] = timePart.split(':');
    let hour = parseInt(hoursStr || (this.timeFormat === 24 ? '0' : '12'), 10);
    const minute = parseInt(minutesStr || '0', 10);
    const second = parseInt(secondsStr || '0', 10);

    if (this.timeFormat === 24) {
      // In 24-hour mode we ignore AM/PM and keep hour as 0-23
      return {
        hour: isNaN(hour) ? 0 : Math.min(Math.max(hour, 0), 23),
        minute: isNaN(minute) ? 0 : Math.min(Math.max(minute, 0), 59),
        second: isNaN(second) ? 0 : Math.min(Math.max(second, 0), 59),
        ampm: ''
      };
    }

    // 12-hour mode: normalize AM/PM and convert 24h inputs if needed
    let ampmValue = ampm === 'PM' || ampm === 'AM' ? ampm : '';
    if (!ampmValue) {
      // No AM/PM provided -> interpret as 24-hour and convert to 12-hour with AM/PM
      if (hour >= 12) {
        ampmValue = 'PM';
        if (hour > 12) hour -= 12;
      } else {
        ampmValue = 'AM';
        if (hour === 0) hour = 12;
      }
    }

    // Clamp to 1-12 range
    if (hour < 1) hour = 1;
    if (hour > 12) hour = 12;

    return {
      hour,
      minute: isNaN(minute) ? 0 : Math.min(Math.max(minute, 0), 59),
      second: isNaN(second) ? 0 : Math.min(Math.max(second, 0), 59),
      ampm: ampmValue
    };
  }

  formatTimeFromComponents(hour: number, minute: number, second: number, ampm: string): string {
    const hStr = hour.toString().padStart(2, '0');
    const minuteStr = minute.toString().padStart(2, '0');
    const secondStr = second.toString().padStart(2, '0');

    if (this.timeFormat === 24) {
      // "HH:mm" or "HH:mm:ss"
      return this.showSeconds
        ? `${hStr}:${minuteStr}:${secondStr}`
        : `${hStr}:${minuteStr}`;
    }

    // 12-hour: "H:MM" or "H:MM:SS" with AM/PM
    const displayHour = hour; // already 1-12
    return this.showSeconds
      ? `${displayHour}:${minuteStr}:${secondStr} ${ampm}`
      : `${displayHour}:${minuteStr} ${ampm}`;
  }

  togglePicker() {
    if (!this.showPicker) {
      this.showPicker = true;
      this.parseTimeValue();
      this.pickerOpened.emit(this.pickerId);
      setTimeout(() => {
        this.scrollToSelectedTimes();
      }, 100);
    } else {
      this.showPicker = false;
      this.pickerClosed.emit(this.pickerId);
    }
  }

  onHourChange(hour: number) {
    this.currentHour = hour;
    this.updateTime();
    setTimeout(() => {
      this.scrollToSelectedTimes();
    }, 50);
  }

  onMinuteChange(minute: number) {
    this.currentMinute = minute;
    this.updateTime();
    setTimeout(() => {
      this.scrollToSelectedTimes();
    }, 50);
  }

  onSecondChange(second: number) {
    this.currentSecond = second;
    this.updateTime();
    setTimeout(() => {
      this.scrollToSelectedTimes();
    }, 50);
  }

  onAMPMChange(ampm: string) {
    this.currentAMPM = ampm;
    this.updateTime();
    setTimeout(() => {
      this.scrollToSelectedTimes();
    }, 50);
  }

  updateTime() {
    const newTime = this.formatTimeFromComponents(
      this.currentHour,
      this.currentMinute,
      this.currentSecond,
      this.currentAMPM
    );
    this.value = newTime;
    this.timeChange.emit(newTime);
  }

  scrollToSelectedTimes() {
    this.timeScrollElements.forEach((elementRef) => {
      const element = elementRef.nativeElement;
      const selectedItem = element.querySelector('.time-item.selected');
      if (selectedItem) {
        const scrollTop = selectedItem.offsetTop - element.offsetHeight / 40 + selectedItem.offsetHeight / 40;
        element.scrollTop = scrollTop;
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.time-picker-wrapper') && this.showPicker) {
      this.showPicker = false;
      this.pickerClosed.emit(this.pickerId);
    }
  }

  private previousCloseCounter: number = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value'] && changes['value'].currentValue) {
      this.parseTimeValue();
    }
    if (changes['closePicker'] && this.showPicker) {
      const newCounter = changes['closePicker'].currentValue;
      // If counter increased, close the picker
      if (newCounter > this.previousCloseCounter) {
        this.showPicker = false;
        this.pickerClosed.emit(this.pickerId);
        this.previousCloseCounter = newCounter;
      }
    }
  }

  // Basic keyboard support on the input (combobox behavior)
  onInputKeydown(event: KeyboardEvent) {
    const key = event.key;

    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      this.togglePicker();
      return;
    }

    if (key === 'Escape' && this.showPicker) {
      this.showPicker = false;
      this.pickerClosed.emit(this.pickerId);
      return;
    }

    // Simple hour increment/decrement when closed
    if (!this.showPicker && (key === 'ArrowUp' || key === 'ArrowDown')) {
      event.preventDefault();
      if (this.timeFormat === 24) {
        if (key === 'ArrowUp') {
          this.currentHour = (this.currentHour + 1) % 24;
        } else {
          this.currentHour = this.currentHour <= 0 ? 23 : this.currentHour - 1;
        }
      } else {
        if (key === 'ArrowUp') {
          this.currentHour = this.currentHour >= 12 ? 1 : this.currentHour + 1;
        } else {
          this.currentHour = this.currentHour <= 1 ? 12 : this.currentHour - 1;
        }
      }
      this.updateTime();
    }
  }
}

