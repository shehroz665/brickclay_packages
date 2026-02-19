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

@Component({
  selector: 'app-root',
  imports: [CalendarModule, FormsModule, CommonModule, BkValidator],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  singleDateSelection: CalendarSelection = new CalendarSelection();
  calenderSelection: CalendarSelection = new CalendarSelection();

  constructor() {}

  ngOnInit(): void {
    this.calenderSelection.startDate = '2026-02-21';
    this.calenderSelection.endDate = '2026-03-22';

    this.singleDateSelection.startDate='2026-02-21'
    this.singleDateSelection.startTime='3:02 AM';

  }

  onCalendarSelected(event: any, calendarId: string) {
    debugger;
    this.calenderSelection.startDate = event.startDate;
    this.calenderSelection.endDate = event.endDate;
  }

  onSingleCalenderSelected(event: any, calendarId: string) {
    debugger;
    this.singleDateSelection.startDate = event.startDate;
    this.singleDateSelection.endDate = event.endDate;
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
