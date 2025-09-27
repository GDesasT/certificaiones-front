//=================[Importaciones]=========
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

//=================[Interfaces]=========
interface DashboardButton {
  title: string;
  description: string;
  icon: string;
  route: string;
}

//=================[Componente Home]=========
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  //=================[Propiedades del Proyecto]=========
  protected readonly projectTitle = 'GLOBAL SAFETY TEXTILES';
  protected readonly projectSubtitle = 'Sistema integral de certificaciones y competencias de seguridad';

  //=================[Configuración de Botones del Dashboard]=========
  buttons: DashboardButton[] = [
    {
      title: 'Certificar Personas',
      description: 'Proceso de certificación de personas. Evaluar y otorgar certificaciones a candidatos.',
      icon: 'bi-award-fill',
      route: '/certificar'
    },
    {
      title: 'Ver Certificaciones',
      description: 'Consultar todas las certificaciones que tiene una persona específica.',
      icon: 'bi-people-fill',
      route: '/certificaciones'
    },
    {
      title: 'Matriz de Entrenamiento',
      description: 'Ver matriz completa de todas las personas entrenadas por área o especialidad.',
      icon: 'bi-table',
      route: '/matriz-entrenamiento'
    }
  ];

  constructor(private router: Router) {}

  //=================[Navegación]=========
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}