import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BkCustomCalendar } from './custom-calendar.component';

describe('BkCustomCalendar', () => {
  let component: BkCustomCalendar;
  let fixture: ComponentFixture<BkCustomCalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BkCustomCalendar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BkCustomCalendar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
