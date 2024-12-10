import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessTableComponent } from './assess-table.component';

describe('AssessTableComponent', () => {
  let component: AssessTableComponent;
  let fixture: ComponentFixture<AssessTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
