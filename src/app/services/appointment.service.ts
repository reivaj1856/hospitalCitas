import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  constructor(private supabase: SupabaseService) {}

  async getAppointments(date?: string) {
    let query = this.supabase.getClient()
      .from('appointments')
      .select('*, patients(id, full_name), appointment_types(id, name), profiles(id, full_name)')
      .order('start_time', { ascending: true });
    
    if (date) query = query.eq('start_time::date', date);
    return await query;
  }

  async deleteAppointment(id: string) {
    return await this.supabase.getClient().from('appointments').delete().eq('id', id);
  }

  async updateAppointment(id: string, changes: { doctor_id: string; start_time: string }) {
    return await this.supabase.getClient().from('appointments').update(changes).eq('id', id);
  }
}