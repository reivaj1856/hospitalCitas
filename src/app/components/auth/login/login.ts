import { Component } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = ''; password = ''; errorMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  async onLogin() {
    try {
      await this.auth.login(this.email, this.password);
      const role = await this.auth.getUserRole();
      
      // Redirección según rol
      if (role === 'admin') this.router.navigate(['/admin']);
      else if (role === 'staff') this.router.navigate(['/staff']);
      else this.router.navigate(['/doctor-dashboard']);
      
    } catch (err: any) {
      this.errorMessage = 'Credenciales incorrectas o error de conexión.';
    }
  }
}
