import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockquestionComponent } from './mockquestion.component';

describe('MockquestionComponent', () => {
  let component: MockquestionComponent;
  let fixture: ComponentFixture<MockquestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockquestionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MockquestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
