import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../services/appointment.service';
import { SupabaseService } from '../../../services/supabase.service';

type AppointmentRecord = {
  id: string;
  patient_id: string;
  doctor_id: string;
  start_time: string;
  status?: string | null;
  patients?: {
    full_name?: string | null;
  } | null;
  appointment_types?: {
    name?: string | null;
  } | null;
  profiles?: {
    full_name?: string | null;
  } | null;
};

type PersonRecord = {
  id: string;
  full_name: string;
  role?: string | null;
};

type PatientRecord = {
  id: string;
  full_name: string;
};

@Component({
  selector: 'app-admin-panel',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css',
})
export class AdminPanel {
  private readonly supabase = inject(SupabaseService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly appointmentStatusCandidates = [
    'scheduled',
    'pending',
    'confirmed',
    'programada',
    'pendiente',
    'confirmada',
  ];

  readonly appointments = signal<AppointmentRecord[]>([]);
  readonly doctors = signal<PersonRecord[]>([]);
  readonly patients = signal<PatientRecord[]>([]);
  readonly isSaving = signal(false);

  isPatientModalOpen = false;
  isAppointmentModalOpen = false;
  activeAppointmentMode: 'detail' | 'edit' | null = null;
  showPatientList = false;
  showDoctorList = false;
  statusMessage: string | null = null;
  isSuccess = false;
  selectedAppointment: AppointmentRecord | null = null;

  private readonly patientSearchSignal = signal('');
  private readonly doctorSearchSignal = signal('');

  get patientSearch() {
    return this.patientSearchSignal();
  }

  set patientSearch(value: string) {
    this.patientSearchSignal.set(value);
  }

  get doctorSearch() {
    return this.doctorSearchSignal();
  }

  set doctorSearch(value: string) {
    this.doctorSearchSignal.set(value);
  }

  newPatient = {
    full_name: '',
    email: '',
    phone: '',
    birth_date: '',
  };
  newAppointment = {
    patient_id: '',
    doctor_id: '',
    type_id: 1,
    start_time: '',
  };

  editAppointment = {
    doctor_id: '',
    start_time: '',
  };

  readonly filteredPatients = computed(() => {
    const search = this.patientSearchSignal().trim().toLowerCase();

    return this.patients().filter((patient) =>
      patient.full_name.toLowerCase().includes(search),
    );
  });

  readonly filteredDoctors = computed(() => {
    const search = this.doctorSearchSignal().trim().toLowerCase();

    return this.doctors().filter((doctor) =>
      doctor.full_name.toLowerCase().includes(search),
    );
  });

  async ngOnInit() {
    await this.refreshData();
  }

  private resetAppointmentForm() {
    this.newAppointment = {
      patient_id: '',
      doctor_id: '',
      type_id: 1,
      start_time: '',
      
    };
    this.patientSearchSignal.set('');
    this.doctorSearchSignal.set('');
    this.showPatientList = false;
    this.showDoctorList = false;
  }

  private resetAppointmentEditor() {
    this.selectedAppointment = null;
    this.activeAppointmentMode = null;
    this.editAppointment = {
      doctor_id: '',
      start_time: '',
    };
  }

  private formatDateTimeLocal(value: string) {
    const date = new Date(value);
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
  }

  formatAppointmentDate(value: string) {
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  private async refreshData() {
    await Promise.all([this.loadDropdownData(), this.loadAppointments()]);
  }

  openPatientModal() {
    this.isPatientModalOpen = true;
    this.statusMessage = null;
    this.isSuccess = false;
  }

  openAppointmentModal() {
    this.isAppointmentModalOpen = true;
    this.statusMessage = null;
    this.isSuccess = false;
  }

  openAppointmentDetail(appointment: AppointmentRecord) {
    this.selectedAppointment = appointment;
    this.activeAppointmentMode = 'detail';
    this.statusMessage = null;
    this.isSuccess = false;
  }

  openAppointmentEdit(appointment: AppointmentRecord) {
    this.selectedAppointment = appointment;
    this.editAppointment = {
      doctor_id: appointment.doctor_id,
      start_time: this.formatDateTimeLocal(appointment.start_time),
    };
    this.activeAppointmentMode = 'edit';
    this.statusMessage = null;
    this.isSuccess = false;
  }

  closeAppointmentInspector() {
    this.resetAppointmentEditor();
  }

  async savePatient() {
    if (!this.newPatient.full_name || !this.newPatient.email) {
      this.statusMessage = 'Por favor, completa al menos el nombre y el correo.';
      this.isSuccess = false;
      return;
    }

    const dataToSave = {
      full_name: this.newPatient.full_name,
      email: this.newPatient.email,
      phone: this.newPatient.phone || null,
      birth_date: this.newPatient.birth_date || null,
    };

    try {
      const { error } = await this.supabase.getClient().from('patients').insert([dataToSave]);

      if (error) throw error;

      this.statusMessage = '¡Paciente registrado exitosamente!';
      this.isSuccess = true;

      this.isPatientModalOpen = false;
      this.newPatient = { full_name: '', email: '', phone: '', birth_date: '' };
    } catch (err: any) {
      this.statusMessage = 'Error: ' + err.message;
      this.isSuccess = false;
    }
  }

  async loadDropdownData() {
    try {
      const [doctorsResult, patientsResult] = await Promise.all([
        this.supabase.getClient().from('profiles').select('id, full_name, role'),
        this.supabase.getClient().from('patients').select('id, full_name'),
      ]);

      const { data: doctorsData, error: doctorsError } = doctorsResult;
      const { data: patientsData, error: patientsError } = patientsResult;

      if (doctorsError) console.error('Error cargando doctores:', doctorsError);
      if (patientsError) console.error('Error cargando pacientes:', patientsError);

      this.doctors.set((doctorsData || []).filter((item) => item.role?.toLowerCase() === 'doctor'));
      this.patients.set(patientsData || []);
    } catch (err) {
      console.error('Error inesperado:', err);
    }
  }

  async loadAppointments() {
    try {
      const { data, error } = await this.appointmentService.getAppointments();

      if (error) {
        console.error('Error cargando citas:', error);
        return;
      }

      this.appointments.set(data || []);
    } catch (err) {
      console.error('Error inesperado:', err);
    }
  }

  async deleteAppointment(appointment: AppointmentRecord) {
    if (!confirm('¿Eliminar esta cita?')) return;

    const { error } = await this.appointmentService.deleteAppointment(appointment.id);

    if (error) {
      this.statusMessage = 'Error: ' + error.message;
      this.isSuccess = false;
      return;
    }

    this.statusMessage = 'Cita eliminada correctamente';
    this.isSuccess = true;
    this.closeAppointmentInspector();
    await this.loadAppointments();
  }

  async updateAppointment() {
    if (!this.selectedAppointment) return;

    if (!this.editAppointment.doctor_id || !this.editAppointment.start_time) {
      this.statusMessage = 'Selecciona doctor y horario para actualizar.';
      this.isSuccess = false;
      return;
    }

    const { error } = await this.appointmentService.updateAppointment(this.selectedAppointment.id, {
      doctor_id: this.editAppointment.doctor_id,
      start_time: this.editAppointment.start_time,
    });

    if (error) {
      this.statusMessage = 'Error: ' + error.message;
      this.isSuccess = false;
      return;
    }

    this.statusMessage = 'Cita actualizada correctamente';
    this.isSuccess = true;
    this.closeAppointmentInspector();
    await this.loadAppointments();
  }

  async saveAppointment() {
    if (this.isSaving()) return;

    if (!this.newAppointment.patient_id || !this.newAppointment.doctor_id || !this.newAppointment.start_time) {
      this.statusMessage = 'Selecciona paciente, doctor y fecha antes de guardar.';
      this.isSuccess = false;
      return;
    }

    this.isSaving.set(true);
    this.statusMessage = null;

    try {
      let lastError: { message: string } | null = null;

      for (const status of this.appointmentStatusCandidates) {
        const { error } = await this.supabase.getClient().from('appointments').insert([
          {
            ...this.newAppointment,
            status,
          },
        ]);

        if (!error) {
          this.statusMessage = 'Cita agendada correctamente';
          this.isSuccess = true;
          this.isAppointmentModalOpen = false;
          this.resetAppointmentForm();
          await this.refreshData();
          return;
        }

        lastError = error;

        if (!error.message.toLowerCase().includes('check constraint')) {
          break;
        }
      }

      this.statusMessage = 'Error: ' + (lastError?.message || 'No se pudo guardar la cita.');
      this.isSuccess = false;
    } catch (err) {
      console.error('Error inesperado:', err);
      this.statusMessage = 'No se pudo guardar la cita.';
      this.isSuccess = false;
    } finally {
      this.isSaving.set(false);
    }
  }

  selectPatient(p: any) {
    this.newAppointment.patient_id = p.id;
    this.patientSearch = p.full_name;
    this.showPatientList = false;
  }

  selectDoctor(d: any) {
    this.newAppointment.doctor_id = d.id;
    this.doctorSearch = d.full_name;
    this.showDoctorList = false;
  }
}
