import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroceryQueueComponent } from './grocery-queue.component';

describe('GroceryQueueComponent', () => {
  let component: GroceryQueueComponent;
  let fixture: ComponentFixture<GroceryQueueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroceryQueueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroceryQueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
