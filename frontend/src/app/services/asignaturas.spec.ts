import { TestBed } from '@angular/core/testing';

import { Asignaturas } from './asignaturas';

describe('Asignaturas', () => {
  let service: Asignaturas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Asignaturas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
