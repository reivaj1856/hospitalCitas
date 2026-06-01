import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';
import { Router } from '@angular/router';

interface DayCell {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  appointments: any[];
}

@Component({
  selector: 'app-doctor-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-panel.html',
  styleUrl: './doctor-panel.css',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class DoctorPanel implements OnInit {
  appointments: any[] = [];
  appointmentGroups: { hourLabel: string; items: any[] }[] = [];
  allAppointments: any[] = [];
  patients: any[] = [];
  appointmentTypes: any[] = [];
  currentUser: any = null;
  
  viewMode: 'today' | 'month' = 'today';
  currentMonth = new Date();
  calendarDays: DayCell[] = [];
  
  selectedDate: Date | null = null;
  showDoctorModal = false;
  doctorNewAppointment = {
    patient_id: '',
    type_id: '',
    start_time: '',
  };
  isSavingAppointment = false;
  statusMessage: string | null = null;
  isSuccess = false;
  
  constructor(private supabase: SupabaseService, private cdr: ChangeDetectorRef, private router: Router) {}

  async ngOnInit() {
    console.log('📍 DoctorPanel ngOnInit iniciado');
    const { data: { user } } = await this.supabase.getClient().auth.getUser();
    if (user) {
      this.currentUser = user;
      console.log('📍 Usuario doctor:', this.currentUser.id);
      await Promise.all([this.loadLookupData(), this.loadAppointments()]);
      this.generateCalendar();
      this.cdr.markForCheck();
    } else {
      console.error('❌ No hay usuario autenticado');
    }
  }

  async loadLookupData() {
    const [patientsResult, typesResult] = await Promise.all([
      this.supabase.getClient().from('patients').select('id, full_name').order('full_name', { ascending: true }),
      this.supabase.getClient().from('appointment_types').select('id, name').order('name', { ascending: true }),
    ]);

    this.patients = patientsResult.data || [];
    this.appointmentTypes = typesResult.data || [];
    this.doctorNewAppointment.type_id = this.appointmentTypes[0]?.id?.toString() ?? '';
  }

  async loadAppointments() {
    if (!this.currentUser) return;
    
    console.log('📍 Cargando citas del doctor...');
    
    const { data, error } = await this.supabase.getClient()
      .from('appointments')
      .select('*, patients(full_name), appointment_types(name), profiles(full_name)')
      .eq('doctor_id', this.currentUser.id)
      .order('start_time', { ascending: true });
    
    if (error) {
      console.error('❌ Error al cargar citas:', error);
    } else {
      console.log('✅ Citas del doctor cargadas:', data);
      this.allAppointments = data || [];
      this.updateViewMode();
    }
  }

  updateViewMode() {
    if (this.viewMode === 'today') {
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = this.allAppointments.filter(apt => {
        const aptDate = apt.start_time.split('T')[0];
        return aptDate === today;
      });
      this.appointmentGroups = this.groupAppointmentsByHour(todayAppointments);
    } else {
      this.generateCalendar();
    }
    this.cdr.markForCheck();
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
    const start = String((hour + 24) % 24);
    const end = String((hour + 1 + 24) % 24);
    return `${start} a ${end}`;
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

  generateCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    this.calendarDays = [];
    let currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const isCurrentMonth = currentDate.getMonth() === month;
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const dayAppointments = this.allAppointments.filter(apt => {
        const aptDate = apt.start_time.split('T')[0];
        return aptDate === dateStr;
      });
      
      this.calendarDays.push({
        date: new Date(currentDate),
        dayOfMonth: currentDate.getDate(),
        isCurrentMonth,
        appointments: dayAppointments,
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  previousMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.generateCalendar();
  }

  getDayName(date: Date): string {
    return date.toLocaleDateString('es-ES', { weekday: 'short' }).substring(0, 3).toUpperCase();
  }

  getMonthName(): string {
    return this.currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  goToRegister() {
    // Navega a la vista de recepción y solicita abrir el modal de nueva cita
    this.router.navigate(['/staff'], { queryParams: { modal: 'appointment', doctorId: this.currentUser?.id } });
  }

  openDoctorModal() {
    this.statusMessage = null;
    this.isSuccess = false;
    this.doctorNewAppointment = {
      patient_id: '',
      type_id: this.appointmentTypes[0]?.id?.toString() ?? '',
      start_time: '',
    };
    this.showDoctorModal = true;
  }

  closeDoctorModal() {
    this.showDoctorModal = false;
    this.statusMessage = null;
    this.isSuccess = false;
  }

  async saveDoctorAppointment() {
    if (this.isSavingAppointment) return;
    if (!this.doctorNewAppointment.patient_id || !this.doctorNewAppointment.type_id || !this.doctorNewAppointment.start_time) {
      this.statusMessage = 'Completa paciente, tipo y fecha.';
      this.isSuccess = false;
      return;
    }

    this.isSavingAppointment = true;
    this.statusMessage = null;
    try {
      const payload = {
        patient_id: this.doctorNewAppointment.patient_id,
        doctor_id: this.currentUser.id,
        type_id: this.doctorNewAppointment.type_id,
        start_time: this.doctorNewAppointment.start_time,
        status: 'scheduled',
      };
      const { error } = await this.supabase.getClient().from('appointments').insert([payload]);
      if (!error) {
        this.statusMessage = 'Cita creada correctamente';
        this.isSuccess = true;
        await this.loadAppointments();
        this.updateViewMode();
        setTimeout(() => this.closeDoctorModal(), 1200);
        return;
      }
      this.statusMessage = 'Error: ' + error.message;
      this.isSuccess = false;
    } catch (err) {
      console.error('Error al guardar cita doctor:', err);
      this.statusMessage = 'No se pudo guardar la cita.';
      this.isSuccess = false;
    } finally {
      this.isSavingAppointment = false;
    }
  }
}
