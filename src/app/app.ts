import { BkInput } from './../../projects/brickclay-lib/src/lib/input/input';
import { BkValidator } from './../../projects/brickclay-lib/src/lib/validator/validator';
import { CalendarSelection } from './../../projects/brickclay-lib/src/lib/calender/components/custom-calendar/custom-calendar.component';
import { BkCheckbox } from './../../projects/brickclay-lib/src/lib/checkbox/checkbox';
import { BkRadioButton } from './../../projects/brickclay-lib/src/lib/radio/radio';
import { FormsModule } from '@angular/forms';
import { BkToggle } from './../../projects/brickclay-lib/src/lib/toggle/toggle';
import { CalendarModule } from './../../projects/brickclay-lib/src/lib/calender/calendar.module';
import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BkCalendarManagerService, CalendarRange } from '../../projects/brickclay-lib/src/lib/calender/services/calendar-manager.service';

export class FuelCardModel {
  fuelCardKey!: number;
  lkpFuelCardTypeKey?: number;
  fuelCardNumber!: string;
  validFrom?: Date | null = null;
  validTo?: Date;
  lkpStatusKey?: number;
  //
  lkpFuelCardTypeName?: string;
  lkpStatusName?: string;
}
export type CalendarVariant =
  | 'single'
  | 'singleApply'
  | 'singleTime'
  | 'singleTimeApply'
  | 'dual'
  | 'dualTime'
  | 'dualTimeApply'
  | 'timeOnly'
  | 'input';
@Component({
  selector: 'app-root',
  imports: [CalendarModule, FormsModule, CommonModule, BkValidator,BkInput],
  templateUrl: './app.html',
  styleUrl: './app.css',
})


export class App implements OnInit {
  singleDatefromSelection: CalendarSelection = new CalendarSelection();
  singleDatetoSelection: CalendarSelection = new CalendarSelection();
  /** Single date popup: values commit only when the user clicks Apply (see [autoApply]="false"). */
  singleDateApplySelection: CalendarSelection = new CalendarSelection();
  /** Single date + time, auto-apply on each change. */
  singleDateTimeSelection: CalendarSelection = new CalendarSelection();
  /** Single date + time; commit date and time only when Apply is clicked. */
  singleDateTimeApplySelection: CalendarSelection = new CalendarSelection();
 number:string= '1112345678';
 cnicString1 :string="1234512345671";
  dropSpecialCharacters = true;
  calenderSelection: CalendarSelection = new CalendarSelection();
  /** Dual range + time pickers (auto-apply; no Apply footer). */
  dualCalendarTimeSelection: CalendarSelection = new CalendarSelection();
  /** Dual range + time; commit when Apply is clicked. */
  dualCalendarTimeApplySelection: CalendarSelection = new CalendarSelection();
  dualDateSelection: CalendarSelection = new CalendarSelection();
countryPhone1 :string="+1 (111) 111-1111";
  /** Which calendar variant to show: single date, dual (range), or time picker only. */
  calendarVariant: CalendarVariant = 'single';

  /** Bound to time picker when variant is 'timeOnly'. */
  timeOnlyValue = '09:04 AM';
  timeOnlyValue1 = '13:04:56';
  // timeOnlyValue : string | null= '13:08';

  customRanges: Record<string, CalendarRange> = {};
  rangeOrder: string[] = [];

  constructor(protected calenderManager: BkCalendarManagerService) {}

  ngOnInit(): void {
    this.calenderSelection.startDate = '2026-02-21';
    this.calenderSelection.endDate = '2026-03-22';
    this.dualCalendarTimeSelection.startDate = '2026-02-21';
    this.dualCalendarTimeSelection.endDate = '2026-03-22';
    this.dualCalendarTimeApplySelection.startDate = '2026-02-21';
    this.dualCalendarTimeApplySelection.endDate = '2026-03-22';
    this.initializeCustomRanges();
    // this.singleDatefromSelection.startDate='2026-02-21'
    // this.singleDatetoSelection.endDate='2026-03-21'


    // this.singleDateSelection.startTime='3:02 AM';

  }

  initializeCustomRanges() {
    const { customRanges, rangeOrder } = this.calenderManager.getCustomRanges();

    this.customRanges = customRanges || {};
    this.rangeOrder = rangeOrder || [];
    //add Last 60 Days to custom ranges
    const today = new Date();
    this.customRanges['Last 60 Days'] = {
      start: this.calenderManager.addDays(today, -59),
      end: today,
    };
    // This Year
  this.customRanges['This Year'] = {
    start: new Date(today.getFullYear(), 0, 1),
    end: new Date(today.getFullYear(), 11, 31),
  };

  // Last Year
  this.customRanges['Last Year'] = {
    start: new Date(today.getFullYear() - 1, 0, 1),
    end: new Date(today.getFullYear() - 1, 11, 31),
  };

  // Last 12 Months
  this.customRanges['Last 12 Months'] = {
    start: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()),
    end: today,
  };
    this.rangeOrder.push('Last 60 Days');
    this.rangeOrder.push('This Year');
    this.rangeOrder.push('Last Year');
    this.rangeOrder.push('Last 12 Months');
  }

  onCalenderSelected(event: any, calendarId: string):void{
    this.dualDateSelection.startDate  = event.startDate;
    this.dualDateSelection.endDate = event.endDate;
  }

  onCalendarSelected(event: any, calendarId: string) {
    if (calendarId === 'dual-time') {
      this.dualCalendarTimeSelection.startDate = event.startDate;
      this.dualCalendarTimeSelection.endDate = event.endDate;
      this.dualCalendarTimeSelection.startTime = event.startTime;
      this.dualCalendarTimeSelection.endTime = event.endTime;
      return;
    }
    if (calendarId === 'dual-time-apply') {
      this.dualCalendarTimeApplySelection.startDate = event.startDate;
      this.dualCalendarTimeApplySelection.endDate = event.endDate;
      this.dualCalendarTimeApplySelection.startTime = event.startTime;
      this.dualCalendarTimeApplySelection.endTime = event.endTime;
      return;
    }
    this.calenderSelection.startDate = event.startDate;
    this.calenderSelection.endDate = event.endDate;
  }

  onSingleCalenderSelected(event: any, calendarId: string) {
    if(calendarId==='to'){
    this.singleDatetoSelection.startDate = event.startDate;
    this.singleDatetoSelection.endDate = event.endDate;
    }
    else if(calendarId==='from'){
    this.singleDatefromSelection.startDate = event.startDate;
    this.singleDatefromSelection.endDate = event.endDate;
    }
    else if (calendarId === 'apply') {
      this.singleDateApplySelection.startDate = event.startDate;
      this.singleDateApplySelection.endDate = event.endDate;
    } else if (calendarId === 'time') {
      this.singleDateTimeSelection.startDate = event.startDate;
      this.singleDateTimeSelection.endDate = event.endDate;
      this.singleDateTimeSelection.startTime = event.startTime;
      this.singleDateTimeSelection.endTime = event.endTime;
    } else if (calendarId === 'timeApply') {
      this.singleDateTimeApplySelection.startDate = event.startDate;
      this.singleDateTimeApplySelection.endDate = event.endDate;
      this.singleDateTimeApplySelection.startTime = event.startTime;
      this.singleDateTimeApplySelection.endTime = event.endTime;
    }

  }

  get singleDateHasError(): boolean {
    return  !!(
      this.singleDateControl?.invalid &&
      (this.singleDateControl?.touched || this.singleDateControl?.dirty)
    );
  }

  @ViewChild('singleDate', { static: false })
  singleDateControl!: any;
}
