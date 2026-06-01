import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  constructor(private supabase: SupabaseService, private router: Router) {}

  async ngOnInit() {
    // 1. Verificamos si hay sesión activa
    const { data: { session } } = await this.supabase.getClient().auth.getSession();

    if (!session) {
      this.router.navigate(['/login']);
      return;
    }

    // 2. Obtenemos el rol desde la base de datos
    const { data: profile } = await this.supabase.getClient()
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // 3. Redirección basada en el rol
    switch (profile?.role) {
      case 'admin': this.router.navigate(['/admin']); break;
      case 'staff': this.router.navigate(['/staff']); break;
      case 'doctor': this.router.navigate(['/doctor-dashboard']); break;
      default: this.router.navigate(['/login']); break;
    }
  }
}
