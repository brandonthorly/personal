import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributionCurveComponent } from './distribution-curve.component';

describe('DistributionCurveComponent', () => {
  let component: DistributionCurveComponent;
  let fixture: ComponentFixture<DistributionCurveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DistributionCurveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DistributionCurveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
