import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionmodalComponent } from './questionmodal.component';

describe('QuestionmodalComponent', () => {
  let component: QuestionmodalComponent;
  let fixture: ComponentFixture<QuestionmodalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionmodalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
