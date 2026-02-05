import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BkCustomCalendar } from './components/custom-calendar/custom-calendar.component';
import { BkScheduledDatePicker } from './components/scheduled-date-picker/scheduled-date-picker.component';
import { BkTimePicker } from './components/time-picker/time-picker.component';



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
    BkCustomCalendar,
    BkScheduledDatePicker,
    BkTimePicker
  ],
  exports: [
    BkCustomCalendar,
    BkScheduledDatePicker,
    BkTimePicker
  ]
})
export class CalendarModule {}


