import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-staff-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './staff-panel.html',
  styleUrl: './staff-panel.css',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class StaffPanel implements OnInit {
  appointments: any[] = [];
  appointmentGroups: { hourLabel: string; items: any[] }[] = [];
  allAppointments: any[] = [];
  patients: any[] = [];
  doctors: any[] = [];
  appointmentTypes: any[] = [];
  appointmentStatusCandidates = [
    'scheduled',
    'pending',
    'confirmed',
    'programada',
    'pendiente',
    'confirmada',
  ];
  
  // Unificamos todo en esta variable
  activeModal: 'detail' | 'patient' | 'appointment' | 'history' | null = null;
  selectedAppointment: any = null;
  isSavingAppointment = false;
  statusMessage: string | null = null;
  isSuccess = false;
  newAppointment = {
    patient_id: '',
    doctor_id: '',
    type_id: '',
    start_time: '',
  };

  constructor(private supabase: SupabaseService, private cdr: ChangeDetectorRef, private route: ActivatedRoute, private router: Router) {}

  async ngOnInit() {
    console.log('📍 ngOnInit iniciado');
    await Promise.all([this.loadLookupData(), this.loadAppointments()]);
    console.log('📍 Datos de lookup y appointments cargados');
    console.log('📍 appointmentGroups:', this.appointmentGroups);
    this.cdr.markForCheck();
    this.loadHistory();

    const qp = this.route.snapshot.queryParamMap;
    const modal = qp.get('modal');
    if (modal === 'appointment') {
      const doctorId = qp.get('doctorId');
      const date = qp.get('date');
      if (doctorId) this.newAppointment.doctor_id = doctorId;
      if (date) this.newAppointment.start_time = date;
      this.openModal('appointment');
      // limpiar query params para no reabrir el modal
      this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
    }
  }

  async loadLookupData() {
    const [patientsResult, doctorsResult, typesResult] = await Promise.all([
      this.supabase.getClient().from('patients').select('id, full_name').order('full_name', { ascending: true }),
      this.supabase.getClient().from('profiles').select('id, full_name, role').order('full_name', { ascending: true }),
      this.supabase.getClient().from('appointment_types').select('id, name').order('name', { ascending: true }),
    ]);

    this.patients = patientsResult.data || [];
    this.doctors = (doctorsResult.data || []).filter((doctor: any) => doctor.role?.toLowerCase() === 'doctor');
    this.appointmentTypes = typesResult.data || [];
    this.newAppointment.type_id = this.appointmentTypes[0]?.id?.toString() ?? '';
  }

  async loadAppointments() {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await this.supabase.getClient()
      .from('appointments')
      .select('*, patients(full_name), appointment_types(name), profiles(full_name)')
      .gte('start_time', `${today}T00:00:00`)
      .lt('start_time', `${today}T23:59:59`)
      .order('start_time', { ascending: true });
    
    console.log('📍 Datos de citas:', data);
    this.appointments = data || [];
    console.log('📍 this.appointments:', this.appointments);
    this.appointmentGroups = this.groupAppointmentsByHour(this.appointments);
    console.log('📍 this.appointmentGroups:', this.appointmentGroups);
    this.cdr.markForCheck();
  }

  async loadHistory() {
    const { data } = await this.supabase.getClient()
      .from('appointments')
      .select('*, patients(full_name), appointment_types(name), profiles(full_name)')
      .order('start_time', { ascending: false });
    
    this.allAppointments = data || [];
  }

  // Método unificado para abrir cualquier modal
  openModal(type: 'detail' | 'patient' | 'appointment' | 'history', data: any = null) {
    this.activeModal = type;
    this.selectedAppointment = data;
    this.statusMessage = null;
    this.isSuccess = false;
    if (type === 'appointment') {
      this.newAppointment = {
        patient_id: '',
        doctor_id: '',
        type_id: this.appointmentTypes[0]?.id?.toString() ?? '',
        start_time: '',
      };
    }
    if (type === 'history') this.loadHistory();
  }

  closeModal() {
    this.activeModal = null;
    this.selectedAppointment = null;
    this.statusMessage = null;
    this.isSuccess = false;
  }

  private groupAppointmentsByHour(items: any[]) {
    const groups = new Map<number, any[]>();

    for (const item of items) {
      const hour = this.getAppointmentHour(item.start_time);
      const current = groups.get(hour) ?? [];
      current.push(item);
      groups.set(hour, current);
    }

    return Array.from(groups.entries())
      .sort(([hourA], [hourB]) => hourA - hourB)
      .map(([hour, groupedItems]) => ({
      hourLabel: this.formatHourRange(hour),
      items: groupedItems,
    }));
  }

  private getAppointmentHour(value: string | null | undefined) {
    if (!value) return 0;
    const hour = Number.parseInt(value.slice(11, 13), 10);
    return Number.isNaN(hour) ? 0 : hour;
  }

  formatHourRange(hour: number) {
    const start = this.normalizeHour(hour);
    const end = this.normalizeHour(hour + 1);
    return `${start} a ${end}`;
  }

  private normalizeHour(hour: number) {
    return String((hour + 24) % 24);
  }

  formatHour(value: string | null | undefined) {
    if (!value) return 'Sin hora';
    return value.slice(11, 16);
  }

  formatDate(value: string | null | undefined) {
    if (!value) return 'Sin fecha';
    return new Date(value).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatDateTime(value: string | null | undefined) {
    if (!value) return 'Sin fecha';
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  async saveAppointment() {
    if (this.isSavingAppointment) return;

    if (!this.newAppointment.patient_id || !this.newAppointment.doctor_id || !this.newAppointment.type_id || !this.newAppointment.start_time) {
      this.statusMessage = 'Completa paciente, doctor, tipo y fecha para guardar.';
      this.isSuccess = false;
      return;
    }

    this.isSavingAppointment = true;
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
          this.isSavingAppointment = false;
          // Cargar datos en background sin bloquear el cierre del modal
          this.loadAppointments();
          this.loadHistory();
          setTimeout(() => this.closeModal(), 1500);
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
      console.error('Error inesperado al guardar cita:', err);
      this.statusMessage = 'No se pudo guardar la cita.';
      this.isSuccess = false;
    } finally {
      this.isSavingAppointment = false;
    }
  }

  async deleteApp(id: string) {
    if (!confirm('¿Eliminar esta cita?')) return;
    const { error } = await this.supabase.getClient().from('appointments').delete().eq('id', id);
    if (!error) {
      this.appointments = this.appointments.filter(a => a.id !== id);
      this.allAppointments = this.allAppointments.filter(a => a.id !== id);
      this.appointmentGroups = this.groupAppointmentsByHour(this.appointments);
      this.closeModal();
    }
  }

  async savePatient(name: string, email: string, phone: string, history: string, birthDate: string) {
    const { error } = await this.supabase.getClient()
      .from('patients')
      .insert([{ 
        full_name: name, 
        email: email,
        phone: phone,
        medical_history: history,
        birth_date: birthDate
      }]);

    if (!error) {
      alert('Paciente registrado correctamente');
      this.closeModal();
      this.loadAppointments(); // Recargamos para refrescar
    } else {
      alert('Error al guardar: ' + error.message);
    }
  }
}
