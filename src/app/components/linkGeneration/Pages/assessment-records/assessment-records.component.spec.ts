import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentRecordsComponent } from './assessment-records.component';

describe('AssessmentRecordsComponent', () => {
  let component: AssessmentRecordsComponent;
  let fixture: ComponentFixture<AssessmentRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentRecordsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
