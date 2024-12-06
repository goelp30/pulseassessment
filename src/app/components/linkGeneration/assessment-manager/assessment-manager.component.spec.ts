import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentManagerComponent } from './assessment-manager.component';

describe('AssessmentManagerComponent', () => {
  let component: AssessmentManagerComponent;
  let fixture: ComponentFixture<AssessmentManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
