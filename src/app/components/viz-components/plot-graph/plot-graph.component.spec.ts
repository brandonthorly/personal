import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlotGraphComponent } from './plot-graph.component';

describe('PlotGraphComponent', () => {
  let component: PlotGraphComponent;
  let fixture: ComponentFixture<PlotGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlotGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlotGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
