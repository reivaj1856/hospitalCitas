import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.html',
})
export class Landing implements AfterViewInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
 stats = [
    { num: '+20', lbl: 'Especialidades' },
    { num: '+50', lbl: 'Médicos expertos' },
    { num: '24/7', lbl: 'Atención de emergencia' },
    { num: '+15k', lbl: 'Pacientes atendidos' },
  ];
 
  services = [
    {
      img: 'https://hablandodeobesidad.com/wp-content/uploads/2023/09/medico.jpg',
      alt: 'Tratamiento Médico',
      title: 'Tratamiento Médico',
      desc: 'Tratamientos especializados para satisfacer todas sus necesidades de salud con la mejor tecnología disponible.',
    },
    {
      img: 'https://www.homecare.com.pe/wp-content/uploads/2021/06/urgencia-medica-atencion-a-domicilio.jpg',
      alt: 'Ayuda de Emergencia',
      title: 'Ayuda de Emergencia',
      desc: 'Servicio disponible las 24 horas para garantizar su seguridad y atención inmediata ante cualquier urgencia.',
    },
    {
      img: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=800&q=60',
      alt: 'Profesionales Médicos',
      title: 'Profesionales Médicos',
      desc: 'Equipo de expertos altamente calificados en diversas ramas de la medicina con años de experiencia.',
    },
    {
      img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=800&q=60',
      alt: 'Doctores Calificados',
      title: 'Doctores Calificados',
      desc: 'Su salud está en manos de especialistas con años de experiencia clínica comprobada y reconocimientos.',
    },
  ];
 
  specialties = [
    {
      img: 'https://d328k6xhl3lmif.cloudfront.net/images/default-source/default-album/medicina_familiar.jpg?sfvrsn=5b3cdc80_0',
      alt: 'Salud Familiar', title: 'Salud Familiar', desc: 'Atención integral para cada integrante de su hogar.',
    },
    {
      img: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=800&q=60',
      alt: 'Cuidado Ocular', title: 'Cuidado Ocular', desc: 'Tratamientos avanzados para la salud visual.',
    },
    {
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4r7pUDfJBH84bvfljzjarOgwVYlyw58HwdA&s',
      alt: 'Salud Infantil', title: 'Salud Infantil', desc: 'Cuidado especializado para los más pequeños.',
    },
    {
      img: 'https://images.squarespace-cdn.com/content/v1/5b91733c9772ae9bb38e47c0/1600647328055-54A27ABC4DEA07QNAWB7/Cirug%C3%ADa+Dental.jpg',
      alt: 'Cirugía Dental', title: 'Cirugía Dental', desc: 'Procedimientos estéticos y correctivos de alta calidad.',
    },
  ];
 
  doctors = [
    { img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSC0tTgGyuhooeFFqVb40PMWNs0Ln3uzZMoBg&s', name: 'Dra. María López', spec: 'Pediatra', tel: '612 445 998' },
    { img: 'https://s3.amazonaws.com/media.audiologydesign.com/wp-content/uploads/sites/518/2023/10/19200951/Central-Texas-Hearing-85_web.jpg', name: 'Dr. Andrés Ramírez', spec: 'Dermatólogo', tel: '634 778 210' },
    { img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=800&q=60', name: 'Dra. Elena Torres', spec: 'Ginecóloga', tel: '699 103 554' },
    { img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=60', name: 'Dr. Carlos Méndez', spec: 'Traumatólogo', tel: '677 901 332' },
  ];
 
  ngAfterViewInit(): void {
    // 1. Verificamos que estamos en el navegador antes de ejecutar la lógica
    if (isPlatformBrowser(this.platformId)) {
      
       const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.classList.remove(
              'opacity-0',
              'translate-y-8',
              'translate-x-8',
              '-translate-x-8',
              'scale-95'
            );
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

      // 2. Seleccionamos los elementos con seguridad
      const elements = document.querySelectorAll('[data-reveal]');
      elements.forEach((el) => observer.observe(el));
    }
  }
}