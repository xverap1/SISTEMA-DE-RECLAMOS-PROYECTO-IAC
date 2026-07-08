import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialAuditoriaComponent } from './historial-auditoria.component';

describe('HistorialAuditoriaComponent', () => {
  let component: HistorialAuditoriaComponent;
  let fixture: ComponentFixture<HistorialAuditoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialAuditoriaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialAuditoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
