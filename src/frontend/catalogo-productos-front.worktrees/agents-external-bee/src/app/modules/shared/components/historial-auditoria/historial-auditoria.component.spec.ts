import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { HistorialAuditoriaComponent } from './historial-auditoria.component';

describe('HistorialAuditoriaComponent', () => {
  let component: HistorialAuditoriaComponent;
  let fixture: ComponentFixture<HistorialAuditoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialAuditoriaComponent],
      providers: [provideHttpClient()]
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
