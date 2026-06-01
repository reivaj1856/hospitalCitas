import { Injectable } from '@angular/core';
import { SupabaseService } from '../services/supabase.service'; // El que ya tienes

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}

  async login(email: string, pass: string) {
    const { data, error } = await this.supabaseService.getClient()
      .auth.signInWithPassword({ email, password: pass });
    
    if (error) throw error;
    return data;
  }

  async getUserRole() {
    const { data: { user } } = await this.supabaseService.getClient().auth.getUser();
    if (!user) return null;
    
    const { data } = await this.supabaseService.getClient()
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    return data?.role;
  }
}