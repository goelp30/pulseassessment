import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkGenerationComponent } from './link-generation.component';

describe('LinkGenerationComponent', () => {
  let component: LinkGenerationComponent;
  let fixture: ComponentFixture<LinkGenerationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkGenerationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinkGenerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
