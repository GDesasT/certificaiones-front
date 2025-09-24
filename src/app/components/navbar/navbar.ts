import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  name: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  companyName = 'Sistema de Certificaciones';
  
  menuItems: MenuItem[] = [
    { name: 'Inicio', route: '/home', icon: 'bi-house-door' },
    { name: 'Certificar Personas', route: '/certificar', icon: 'bi-award' },
    { name: 'Ver Certificaciones', route: '/certificaciones', icon: 'bi-search' },
    { name: 'Matriz de Entrenamiento', route: '/matriz-entrenamiento', icon: 'bi-table' }
  ];
}