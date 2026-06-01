import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorPanel } from './doctor-panel';

describe('DoctorPanel', () => {
  let component: DoctorPanel;
  let fixture: ComponentFixture<DoctorPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
