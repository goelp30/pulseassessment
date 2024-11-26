import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessHeaderComponent } from './assess-header.component';

describe('AssessHeaderComponent', () => {
  let component: AssessHeaderComponent;
  let fixture: ComponentFixture<AssessHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
