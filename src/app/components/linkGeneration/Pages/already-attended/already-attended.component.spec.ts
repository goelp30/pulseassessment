import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlreadyAttendedComponent } from './already-attended.component';

describe('AlreadyAttendedComponent', () => {
  let component: AlreadyAttendedComponent;
  let fixture: ComponentFixture<AlreadyAttendedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlreadyAttendedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlreadyAttendedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
