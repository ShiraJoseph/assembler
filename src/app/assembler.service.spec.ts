import { TestBed } from '@angular/core/testing';

import { AssemblerService } from './assembler.service';

describe('AssemblerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AssemblerService = TestBed.get(AssemblerService);
    expect(service).toBeTruthy();
  });
});
