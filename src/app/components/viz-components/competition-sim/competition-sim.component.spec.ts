import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompetitionSimComponent } from './competition-sim.component';

describe('CompetitionSimComponent', () => {
  let component: CompetitionSimComponent;
  let fixture: ComponentFixture<CompetitionSimComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompetitionSimComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompetitionSimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
