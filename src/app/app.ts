import { CheckboxComponent } from './../../projects/brickclay-lib/src/lib/checkbox/checkbox';
import { RadioComponent } from './../../projects/brickclay-lib/src/lib/radio/radio';
import { FormsModule } from '@angular/forms';
import { ToggleComponent } from './../../projects/brickclay-lib/src/lib/toggle/toggle';
import { CalendarModule } from './../../projects/brickclay-lib/src/lib/calender/calendar.module';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  imports: [CalendarModule, ToggleComponent, FormsModule, RadioComponent, CheckboxComponent],
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

  selectedSeason = 'Winter';
  onChangeToggle(val:boolean):void {
    console.warn('val',val)
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
}
