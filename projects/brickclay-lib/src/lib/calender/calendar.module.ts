import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomCalendarComponent } from './components/custom-calendar/custom-calendar.component';
import { ScheduledDatePickerComponent } from './components/scheduled-date-picker/scheduled-date-picker.component';
import { TimePickerComponent } from './components/time-picker/time-picker.component';



/**
 * Optional NgModule wrapper for projects that prefer module-based usage.
 *
 * Note:
 * - The components themselves are standalone, so you can also import them
 *   directly into any standalone component without using this module.
 * - This module is mainly for:
 *   - Existing apps that still use feature modules
 *   - Easier "plug-and-play" integration: import CalendarModule once and use
 *     the three exported components anywhere in your templates.
 */
@NgModule({
  imports: [
    CommonModule,
    CustomCalendarComponent,
    ScheduledDatePickerComponent,
    TimePickerComponent
  ],
  exports: [
    CustomCalendarComponent,
    ScheduledDatePickerComponent,
    TimePickerComponent
  ]
})
export class CalendarModule {}


