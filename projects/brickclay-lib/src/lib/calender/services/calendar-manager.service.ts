import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarManagerService {
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
}


