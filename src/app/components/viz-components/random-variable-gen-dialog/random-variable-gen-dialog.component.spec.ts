import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RandomVariableGenDialogComponent } from './random-variable-gen-dialog.component';

describe('RandomVariableGenDialogComponent', () => {
  let component: RandomVariableGenDialogComponent;
  let fixture: ComponentFixture<RandomVariableGenDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RandomVariableGenDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RandomVariableGenDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
