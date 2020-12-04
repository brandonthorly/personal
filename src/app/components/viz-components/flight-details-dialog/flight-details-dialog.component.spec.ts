import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightDetailsDialogComponent } from './flight-details-dialog.component';

describe('FlightDetailsDialogComponent', () => {
  let component: FlightDetailsDialogComponent;
  let fixture: ComponentFixture<FlightDetailsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlightDetailsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
