import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestiontableComponent } from './questiontable.component';

describe('MockquestionComponent', () => {
  let component: QuestiontableComponent;
  let fixture: ComponentFixture<QuestiontableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestiontableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestiontableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
