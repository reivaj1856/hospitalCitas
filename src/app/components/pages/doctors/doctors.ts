import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DoctorListComponent, type DoctorCard } from '../../features/doctor-list/doctor-list';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-doctors',
  imports: [FormsModule, DoctorListComponent],
  templateUrl: './doctors.html',
  styleUrl: './doctors.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Doctors implements OnInit {
  private readonly supabase = inject(SupabaseService);
  readonly doctors = signal<DoctorCard[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly statusMessage = signal<string | null>(null);
  readonly isSuccess = signal(false);

  isDoctorModalOpen = false;
  newDoctor = {
    doctor_id: '',
    start_time: '08:00',
    end_time: '18:00',
  };

  async ngOnInit() {
    await this.loadDoctors();
  }

  openDoctorModal() {
    this.isDoctorModalOpen = true;
    this.statusMessage.set(null);
    this.isSuccess.set(false);
  }

  closeDoctorModal() {
    this.isDoctorModalOpen = false;
    this.statusMessage.set(null);
    this.isSuccess.set(false);
  }

  async loadDoctors() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const { data, error } = await this.supabase
        .getClient()
        .from('profiles')
        .select('id, full_name, role')
        .eq('role', 'doctor')
        .order('full_name', { ascending: true });

      if (error) {
        this.errorMessage.set('No se pudo cargar la lista de doctores.');
        return;
      }

      this.doctors.set((data || []) as DoctorCard[]);
    } catch (err) {
      console.error('Error inesperado cargando doctores:', err);
      this.errorMessage.set('Ocurrió un error inesperado al cargar los doctores.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async saveDoctor() {
    void this.supabase;
    this.statusMessage.set('Funcionalidad aún no implementada. Contactarse con el administrador.');
    this.isSuccess.set(false);
  }
}
