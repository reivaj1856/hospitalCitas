import { RouterLink } from '@angular/router';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  userRole: string | null = null;
  isAuthenticated = false;

  // 2. Inyéctalo en el constructor
  constructor(
    private supabase: SupabaseService, 
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {}

  async performLogout() {
    await this.supabase.logout();
    this.router.navigate(['/login']);
  }

  async ngOnInit() {
    this.supabase.getClient().auth.onAuthStateChange((event, session) => {
      this.isAuthenticated = !!session;
      if (session) {
        this.loadUserRole(session.user.id);
      } else {
        this.userRole = null;
      }
    });
  }

  async loadUserRole(userId: string) {
    const { data } = await this.supabase.getClient()
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    this.userRole = data?.role;

    // 3. FUERZA LA DETECCIÓN DE CAMBIOS tras actualizar el rol
    this.cdr.detectChanges(); 
  }
}