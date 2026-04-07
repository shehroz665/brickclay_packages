import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface CalendarRange {
  start: Date;
  end: Date;
}

export interface CustomRangesConfig {
  customRanges?: Record<string, CalendarRange>;
  rangeOrder: string[];
}

@Injectable({
  providedIn: 'root'
})
export class BkCalendarManagerService {
  private calendarInstances: Set<() => void> = new Set();
  private closeAllSubject = new Subject<void>();

  closeAll$ = this.closeAllSubject.asObservable();

  customRanges: Record<string, CalendarRange> = {};
  rangeOrder: string[] = [];

  constructor() {
    this.initializeDefaultRanges();
  }

  /**
   * Returns service-defined custom ranges and their display order.
   * Used when the calendar does not pass customRanges via @Input().
   */
  getCustomRanges(): CustomRangesConfig {
    this.initializeDefaultRanges();
    return {
      customRanges: { ...this.customRanges },
      rangeOrder: [...this.rangeOrder],
    };
  }

  initializeDefaultRanges(): void {
    const today = new Date();

    this.customRanges = {
      Today: {
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      },
      Yesterday: {
        start: this.addDays(today, -1),
        end: this.addDays(today, -1),
      },
      'Last 7 Days': {
        start: this.addDays(today, -6),
        end: today,
      },
      'Last 30 Days': {
        start: this.addDays(today, -29),
        end: today,
      },
      'This Month': {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: new Date(today.getFullYear(), today.getMonth() + 1, 0),
      },
      'Last Month': {
        start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        end: new Date(today.getFullYear(), today.getMonth(), 0),
      },
      'Custom Range': {
        start: new Date(),
        end: new Date(),
      },
    };

    this.rangeOrder = [
      'Today',
      'Yesterday',
      'Last 7 Days',
      'Last 30 Days',
      'This Month',
      'Last Month',
      'Custom Range',
    ];
  }

  addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  /**
   * Register a calendar instance with its close function
   */
  register(closeFn: () => void): () => void {
    this.calendarInstances.add(closeFn);

    // Return unregister function
    return () => {
      this.calendarInstances.delete(closeFn);
    };
  }

  /**
   * Close all calendars except the one being opened
   */
  closeAllExcept(exceptCloseFn: () => void): void {
    this.calendarInstances.forEach(closeFn => {
      if (closeFn !== exceptCloseFn) {
        closeFn();
      }
    });
  }

  /**
   * Close all calendars
   */
  closeAll(): void {
    this.closeAllSubject.next();
    this.calendarInstances.forEach(closeFn => closeFn());
  }

  getOnlyDate(input: string | Date): string {
    const date = new Date(input);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
