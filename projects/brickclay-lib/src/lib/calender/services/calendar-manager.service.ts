import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BkCalendarManagerService {
  private calendarInstances: Set<() => void> = new Set();
  private closeAllSubject = new Subject<void>();

  closeAll$ = this.closeAllSubject.asObservable();

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


