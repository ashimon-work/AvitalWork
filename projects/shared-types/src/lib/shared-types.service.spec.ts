import { TestBed } from '@angular/core/testing';

import { SharedTypesService } from './shared-types.service';

describe('SharedTypesService', () => {
  let service: SharedTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
