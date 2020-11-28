import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BinDataBarGraphComponent } from './bin-data-bar-graph.component';

describe('BinDataBarGraphComponent', () => {
  let component: BinDataBarGraphComponent;
  let fixture: ComponentFixture<BinDataBarGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BinDataBarGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BinDataBarGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
