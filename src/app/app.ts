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
export type CalendarVariant = 'single' | 'dual' | 'timeOnly';
@Component({
  selector: 'app-root',
  imports: [CalendarModule, FormsModule, CommonModule, BkValidator],
  templateUrl: './app.html',
  styleUrl: './app.css',
})


export class App implements OnInit {
  singleDatefromSelection: CalendarSelection = new CalendarSelection();
  singleDatetoSelection: CalendarSelection = new CalendarSelection();

  calenderSelection: CalendarSelection = new CalendarSelection();
  dualDateSelection: CalendarSelection = new CalendarSelection();

  /** Which calendar variant to show: single date, dual (range), or time picker only. */
  calendarVariant: CalendarVariant = 'single';

  /** Bound to time picker when variant is 'timeOnly'. */
  timeOnlyValue = '09:04 AM';
  timeOnlyValue1 = '13:04:56';
  // timeOnlyValue : string | null= '13:08';

  constructor() {}

  ngOnInit(): void {
    this.calenderSelection.startDate = '2026-02-21';
    this.calenderSelection.endDate = '2026-03-22';

    // this.singleDatefromSelection.startDate='2026-02-21'
    // this.singleDatetoSelection.endDate='2026-03-21'


    // this.singleDateSelection.startTime='3:02 AM';

  }

  onCalenderSelected(event: any, calendarId: string):void{
    this.dualDateSelection.startDate  = event.startDate;
    this.dualDateSelection.endDate = event.endDate;
  }

  onCalendarSelected(event: any, calendarId: string) {
    debugger;
    this.calenderSelection.startDate = event.startDate;
    this.calenderSelection.endDate = event.endDate;
  }

  onSingleCalenderSelected(event: any, calendarId: string) {
    debugger;
    if(calendarId==='to'){
    this.singleDatetoSelection.startDate = event.startDate;
    this.singleDatetoSelection.endDate = event.endDate;
    }
    else if(calendarId==='from'){
    this.singleDatefromSelection.startDate = event.startDate;
    this.singleDatefromSelection.endDate = event.endDate;
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
