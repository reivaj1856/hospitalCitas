import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type DoctorCard = {
  id: string;
  full_name: string;
  role?: string | null;
};

@Component({
  selector: 'app-doctor-list',
  templateUrl: './doctor-list.html',
  styleUrl: './doctor-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorListComponent {
  doctors = input.required<DoctorCard[]>();
  registerDoctor = output<void>();

  getDoctorInitials(fullName: string) {
    return fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }
}
