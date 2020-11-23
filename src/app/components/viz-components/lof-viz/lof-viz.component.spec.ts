import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LofVizComponent } from './lof-viz.component';

describe('LofVizComponent', () => {
  let component: LofVizComponent;
  let fixture: ComponentFixture<LofVizComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LofVizComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LofVizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
