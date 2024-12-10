import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluateAssessmentComponent } from './evaluate-assessment.component';

describe('EvaluateAssessmentComponent', () => {
  let component: EvaluateAssessmentComponent;
  let fixture: ComponentFixture<EvaluateAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluateAssessmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluateAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
