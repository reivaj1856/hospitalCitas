import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { Environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

      constructor() {
        this.supabase = createClient(Environment.supabaseUrl, Environment.supabaseKey);
      }

  // Getter para usar el cliente en otros servicios
  getClient() {
    return this.supabase;
  }

  // Auth helper: Obtener usuario actual
  async getCurrentUser(): Promise<User | null> {
    const { data } = await this.supabase.auth.getUser();
    return data.user;
  }

  // Métodos que ya tenías...
  async getAppointments() {
    return await this.supabase.from('appointments').select(`
        id, start_time, status,
        patients(full_name),
        profiles(full_name)
    `);
  }

  async addAppointment(appointment: any) {
    return await this.supabase.from('appointments').insert([appointment]);
  }
  // En tu supabase.service.ts
  async logout() {
    await this.getClient().auth.signOut();
    // Al hacer signOut, el onAuthStateChange del Navbar se disparará automáticamente
  }
}