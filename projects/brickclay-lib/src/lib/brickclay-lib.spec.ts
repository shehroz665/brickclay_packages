import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrickclayLib } from './brickclay-lib';

describe('BrickclayLib', () => {
  let component: BrickclayLib;
  let fixture: ComponentFixture<BrickclayLib>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrickclayLib]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrickclayLib);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
