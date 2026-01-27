import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomCalendarComponent, CalendarSelection } from '../custom-calendar/custom-calendar.component';
import { TimePickerComponent } from '../time-picker/time-picker.component';

export interface TimeConfiguration {
  date: Date;
  allDay: boolean;
  startTime: string; // Format: "HH:mm" or "HH:mm:ss"
  endTime: string; // Format: "HH:mm" or "HH:mm:ss"
}

export interface ScheduledDateSelection {
  mode: 'single' | 'multiple' | 'range';
  singleDate?: {
    startDate: Date;
    endDate: Date;
    allDay: boolean;
    startTime: string;
    endTime: string;
  };
  multipleDates?: TimeConfiguration[];
  dateRange?: {
    startDate: Date;
    endDate: Date;
    allDay: boolean;
    startTime: string;
    endTime: string;
  };
}

@Component({
  selector: 'brickclay-scheduled-date-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomCalendarComponent, TimePickerComponent],
  templateUrl: './scheduled-date-picker.component.html',
  styleUrls: ['./scheduled-date-picker.component.css']
})
export class ScheduledDatePickerComponent implements OnInit {
  @Input() timeFormat: 12 | 24 = 12;
  @Input() enableSeconds = false;

  @Output() scheduled = new EventEmitter<ScheduledDateSelection>();
  @Output() cleared = new EventEmitter<void>();

  activeTab: 'single' | 'multiple' | 'range' = 'single';
  openTimePickerId: string | null = null; // Track which time picker is currently open
  closePickerCounter: { [key: string]: number } = {}; // Track close signals for each picker

  // Single Date
  singleDate: Date | null = null;
  singleAllDay = false;
  singleStartTime = '1:00 AM';
  singleEndTime = '2:00 AM';

  // Multiple Dates
  multipleDates: TimeConfiguration[] = [];

  // Date Range
  rangeStartDate: Date | null = null;
  rangeEndDate: Date | null = null;
  rangeAllDay = false;
  rangeStartTime = '1:00 AM';
  rangeEndTime = '2:00 AM';

  ngOnInit() {
    // Initialize with default time if needed
  }

  onTabChange(tab: 'single' | 'multiple' | 'range') {
    this.activeTab = tab;
    this.openTimePickerId = null; // Close any open pickers when switching tabs
  }

  onTimePickerOpened(pickerId: string) {
    // Close all other pickers when one opens
    if (this.openTimePickerId && this.openTimePickerId !== pickerId) {
      // Increment close counter for the previously open picker
      if (!this.closePickerCounter[this.openTimePickerId]) {
        this.closePickerCounter[this.openTimePickerId] = 0;
      }
      this.closePickerCounter[this.openTimePickerId]++;
    }
    this.openTimePickerId = pickerId;
  }

  onTimePickerClosed(pickerId: string) {
    // Reset open picker ID if this was the open one
    if (this.openTimePickerId === pickerId) {
      this.openTimePickerId = null;
    }
  }

  shouldClosePicker(pickerId: string): number {
    // Return the counter value for this picker (triggers change detection)
    return this.closePickerCounter[pickerId] || 0;
  }

  // Single Date Handlers
  onSingleDateSelected(event: CalendarSelection) {
    if (event.startDate) {
      this.singleDate = new Date(event.startDate);
      // Initialize time if not all day
      if (!this.singleAllDay) {
        this.updateSingleDateTimes();
      }
      this.emitScheduled();
    } else {
      this.singleDate = null;
    }
  }

  onSingleAllDayChange() {
    this.singleAllDay = !this.singleAllDay;
    if (this.singleDate) {
      this.updateSingleDateTimes();
      this.emitScheduled();
    }
  }

  onSingleStartTimeChange(time: string) {
    this.singleStartTime = time;
    if (this.singleDate) {
      this.updateSingleDateTimes();
      this.emitScheduled();
    }
  }

  onSingleEndTimeChange(time: string) {
    this.singleEndTime = time;
    if (this.singleDate) {
      this.updateSingleDateTimes();
      this.emitScheduled();
    }
  }

  updateSingleDateTimes() {
    if (!this.singleDate) return;
    if (this.singleAllDay) {
      this.singleDate.setHours(0, 0, 0, 0);
    } else {
      const startTime = this.parseTimeString(this.singleStartTime);
      const endTime = this.parseTimeString(this.singleEndTime);
      this.singleDate.setHours(startTime.hours, startTime.minutes, 0, 0);
    }
  }

  // Multiple Dates Handlers
  onMultipleDatesSelected(event: CalendarSelection) {
    if (event.selectedDates && event.selectedDates.length > 0) {
      const newDates: TimeConfiguration[] = [];

      event.selectedDates.forEach(date => {
        const dateStr = this.getDateString(date);
        const existing = this.multipleDates.find(d => this.getDateString(d.date) === dateStr);

        if (existing) {
          newDates.push(existing);
        } else {
          // Create new time configuration for this date
          newDates.push({
            date: new Date(date),
            allDay: false,
            startTime: '1:00 AM',
            endTime: '2:00 AM'
          });
        }
      });

      this.multipleDates = newDates;
      this.emitScheduled();
    } else {
      this.multipleDates = [];
      this.emitScheduled();
    }
  }

  onMultipleDateAllDayChange(index: number) {
    if (this.multipleDates[index]) {
      this.multipleDates[index].allDay = !this.multipleDates[index].allDay;
      if (this.multipleDates[index].allDay) {
        this.multipleDates[index].date.setHours(0, 0, 0, 0);
      } else {
        const time = this.parseTimeString(this.multipleDates[index].startTime);
        this.multipleDates[index].date.setHours(time.hours, time.minutes, 0, 0);
      }
      this.emitScheduled();
    }
  }

  onMultipleDateStartTimeChange(index: number, time: string) {
    if (this.multipleDates[index]) {
      this.multipleDates[index].startTime = time;
      if (!this.multipleDates[index].allDay) {
        const parsed = this.parseTimeString(time);
        this.multipleDates[index].date.setHours(parsed.hours, parsed.minutes, 0, 0);
      }
      this.emitScheduled();
    }
  }

  onMultipleDateEndTimeChange(index: number, time: string) {
    if (this.multipleDates[index]) {
      this.multipleDates[index].endTime = time;
      this.emitScheduled();
    }
  }

  // Date Range Handlers
  onRangeSelected(event: CalendarSelection) {
    if (event.startDate && event.endDate) {
      this.rangeStartDate = new Date(event.startDate);
      this.rangeEndDate = new Date(event.endDate);
      if (!this.rangeAllDay) {
        this.updateRangeTimes();
      }
      this.emitScheduled();
    } else {
      this.rangeStartDate = null;
      this.rangeEndDate = null;
    }
  }

  onRangeAllDayChange() {
    this.rangeAllDay = !this.rangeAllDay;
    if (this.rangeStartDate && this.rangeEndDate) {
      this.updateRangeTimes();
      this.emitScheduled();
    }
  }

  onRangeStartTimeChange(time: string) {
    this.rangeStartTime = time;
    if (this.rangeStartDate && !this.rangeAllDay) {
      this.updateRangeTimes();
      this.emitScheduled();
    }
  }

  onRangeEndTimeChange(time: string) {
    this.rangeEndTime = time;
    if (this.rangeEndDate && !this.rangeAllDay) {
      this.updateRangeTimes();
      this.emitScheduled();
    }
  }

  updateRangeTimes() {
    if (!this.rangeStartDate || !this.rangeEndDate) return;

    if (this.rangeAllDay) {
      this.rangeStartDate.setHours(0, 0, 0, 0);
      this.rangeEndDate.setHours(23, 59, 59, 999);
    } else {
      const startTime = this.parseTimeString(this.rangeStartTime);
      const endTime = this.parseTimeString(this.rangeEndTime);
      this.rangeStartDate.setHours(startTime.hours, startTime.minutes, 0, 0);
      this.rangeEndDate.setHours(endTime.hours, endTime.minutes, 0, 0);
    }
  }

  // Utility Methods
  parseTimeString(timeStr: string): { hours: number; minutes: number } {
    // Parse time string like "7:01 AM" or "19:01"
    const parts = timeStr.split(' ');
    let timePart = parts[0];
    const ampm = parts[1];

    const [hoursStr, minutesStr] = timePart.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr || '0', 10);

    if (ampm) {
      if (ampm.toUpperCase() === 'PM' && hours !== 12) {
        hours += 12;
      } else if (ampm.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
      }
    }

    return { hours, minutes };
  }

  getDateString(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  formatDate(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  emitScheduled() {
    const selection: ScheduledDateSelection = {
      mode: this.activeTab
    };

    if (this.activeTab === 'single' && this.singleDate) {
      // For single date, create startDate and endDate with same date but different times
      const startDate = new Date(this.singleDate);
      const endDate = new Date(this.singleDate);

      if (!this.singleAllDay) {
        const startTime = this.parseTimeString(this.singleStartTime);
        const endTime = this.parseTimeString(this.singleEndTime);
        startDate.setHours(startTime.hours, startTime.minutes, 0, 0);
        endDate.setHours(endTime.hours, endTime.minutes, 0, 0);
      } else {
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
      }

      selection.singleDate = {
        startDate: startDate,
        endDate: endDate,
        allDay: this.singleAllDay,
        startTime: this.singleStartTime,
        endTime: this.singleEndTime
      };
    } else if (this.activeTab === 'multiple') {
      selection.multipleDates = this.multipleDates.map(d => ({
        date: new Date(d.date),
        allDay: d.allDay,
        startTime: d.startTime,
        endTime: d.endTime
      }));
    } else if (this.activeTab === 'range' && this.rangeStartDate && this.rangeEndDate) {
      selection.dateRange = {
        startDate: new Date(this.rangeStartDate),
        endDate: new Date(this.rangeEndDate),
        allDay: this.rangeAllDay,
        startTime: this.rangeStartTime,
        endTime: this.rangeEndTime
      };
    }

    this.scheduled.emit(selection);
  }

  clear() {
    this.singleDate = null;
    this.multipleDates = [];
    this.rangeStartDate = null;
    this.rangeEndDate = null;
    this.singleAllDay = false;
    this.rangeAllDay = false;
    this.singleStartTime = '1:00 AM';
    this.singleEndTime = '2:00 AM';
    this.rangeStartTime = '1:00 AM';
    this.rangeEndTime = '2:00 AM';
    this.cleared.emit();
  }

  apply() {
    this.emitScheduled();
  }

}

