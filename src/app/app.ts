import { BkCheckbox } from './../../projects/brickclay-lib/src/lib/checkbox/checkbox';
import { BkRadioButton } from './../../projects/brickclay-lib/src/lib/radio/radio';
import { FormsModule } from '@angular/forms';
import { BkToggle } from './../../projects/brickclay-lib/src/lib/toggle/toggle';
import { CalendarModule } from './../../projects/brickclay-lib/src/lib/calender/calendar.module';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
export class FuelCardModel {
    fuelCardKey!: number;
    lkpFuelCardTypeKey?: number;
    fuelCardNumber!: string;
    validFrom?: Date| null = null;
    validTo?: Date;
    lkpStatusKey?: number;
    //
    lkpFuelCardTypeName?:string;
    lkpStatusName?:string;
}


@Component({
  selector: 'app-root',
  imports: [CalendarModule, BkToggle, FormsModule, BkRadioButton, BkCheckbox],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('brickclay-workspace');
  temp = false;
  valOff = false;
  valOn = true;
  tempChekbox:boolean=false;
  radioButton:string = 'yes';
  off = 0;
  on = 1;
  startDate: Date | null = new Date();
  selectedSeason = 'Winter';
  object = new FuelCardModel();
  constructor() {
    this.object.fuelCardKey = 1017;
    this.object.lkpFuelCardTypeKey = 30767;
    this.object.fuelCardNumber = "Lorem Ipsum is simply dummy text of the printing";
    this.object.validFrom = new Date("2026-02-24T19:00:00");
    this.object.validTo = new Date("2026-01-15T00:00:00");
    this.object.lkpStatusKey = 30758;
    this.object.lkpFuelCardTypeName = "Fuel Card Shell";
    this.object.lkpStatusName = "In Active";
}
  onChangeToggle(val:boolean):void {
    console.warn('val',val);

  }
  onChangeCheckbox(val:boolean):void {
    alert()
    this.tempChekbox=val;
    console.error('on change checkbox',val)
  }
  onChangeRadioButton(value:string) : void {
    this.selectedSeason = value
        console.warn('on change radio button',value)
  }

  onCalendarSelected(event: any, calendarId: string) {

    debugger;
    this.object.validFrom = event.startDate;

  }

  add2Days(){
    const d = new Date();
    d.setDate(d.getDate() + 2);
    this.startDate = d;
  }


}
