import { Routes } from '@angular/router';
import { Layout } from './components/layout/layout';
import { Landing } from './components/pages/landing/landing';
import { Login } from './components/auth/login/login';  
import { Dashboard } from './components/pages/dashboard/dashboard';
import { DoctorPanel } from './components/pages/doctor-panel/doctor-panel';
import { Doctors } from './components/pages/doctors/doctors';
import { StaffPanel } from './components/pages/staff-panel/staff-panel';
import { AdminPanel } from './components/pages/admin-panel/admin-panel';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: Layout, // Este componente tiene el <app-navbar> y <router-outlet>
    children: [
      { path: '', component: Landing },
      { path: 'login', component: Login },
      { path: 'dashboard', component: Dashboard },
      { path: 'doctor-dashboard', component: DoctorPanel, canActivate: [AuthGuard], data: { roles: ['doctor'] } },
      { path: 'doctors', component: Doctors, canActivate: [AuthGuard], data: { roles: ['admin'] } },
      { path: 'staff', component: StaffPanel, canActivate: [AuthGuard], data: { roles: ['staff','reception','admin'] } },
      { path: 'admin', component: AdminPanel, canActivate: [AuthGuard], data: { roles: ['admin'] } },
      // Agrega aquí admin-panel y staff-panel
    ]
  }
];