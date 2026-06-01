import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class appointmentLogicService {
  // appointment-logic.service.ts
  constructor(private supabase: SupabaseService) {}
async isSlotAvailable(doctorId: string, startTime: Date, typeId: string): Promise<boolean> {
  const { data: type } = await this.supabase.getClient().from('appointment_types').select('duration_minutes').eq('id', typeId).single();
  if (!type) return false;
  const endTime = new Date(startTime.getTime() + type.duration_minutes * 60000);

  // 1. Verificar si hay solapamiento con citas existentes
  const { data: conflicts } = await this.supabase.getClient()
    .from('appointments')
    .select('*')
    .eq('doctor_id', doctorId)
    .gte('start_time', startTime.toISOString())
    .lt('start_time', endTime.toISOString());

  return !conflicts || conflicts.length === 0;
}
}