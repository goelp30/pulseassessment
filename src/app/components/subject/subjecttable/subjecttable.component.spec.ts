import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjecttableComponent } from './subjecttable.component';

describe('SubjecttableComponent', () => {
  let component: SubjecttableComponent;
  let fixture: ComponentFixture<SubjecttableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjecttableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjecttableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
