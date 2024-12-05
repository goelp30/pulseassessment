import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentResponseComponent } from './assessment-response.component';

describe('AssessmentResponseComponent', () => {
  let component: AssessmentResponseComponent;
  let fixture: ComponentFixture<AssessmentResponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentResponseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
