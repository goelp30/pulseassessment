import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { linkStatusGuard } from './link-status.guard';

describe('linkStatusGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => linkStatusGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
