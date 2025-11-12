import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Estimacion } from './estimacion';

describe('Estimacion', () => {
  let component: Estimacion;
  let fixture: ComponentFixture<Estimacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Estimacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Estimacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
