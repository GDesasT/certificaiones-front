//=================[Importaciones]=========
import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

//=================[Interfaces]=========
interface MenuItem {
  name: string;
  route?: string;
  icon: string;
  action?: () => void;
  requiresConfirmation?: boolean;
}

//=================[Componente Navbar]=========
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  //=================[Propiedades]=========
  protected readonly companyName = signal('CertiSafe');
  protected readonly isMenuCollapsed = signal(true);
  
  constructor(private router: Router) {}
  
  //=================[Configuración del Menú]=========
  protected readonly menuItems: MenuItem[] = [
    { name: 'Inicio', route: '/home', icon: 'bi-house-door-fill' },
    { name: 'Certificar Personas', route: '/certificar', icon: 'bi-award-fill' },
    { name: 'Ver Certificaciones', route: '/certificaciones', icon: 'bi-search' },
    { name: 'Matriz de Entrenamiento', route: '/matriz-entrenamiento', icon: 'bi-table' },
    { 
      name: 'Cerrar Sesión', 
      icon: 'bi-box-arrow-right',
      action: () => this.logout(),
      requiresConfirmation: true
    }
  ];

  //=================[Computed Properties]=========
  protected readonly navigationItems = computed(() => 
    this.menuItems.filter(item => item.route)
  );
  
  protected readonly actionItems = computed(() => 
    this.menuItems.filter(item => item.action)
  );

  //=================[Métodos de Navegación]=========
  toggleMenu(): void {
    this.isMenuCollapsed.set(!this.isMenuCollapsed());
  }

  collapseMenu(): void {
    this.isMenuCollapsed.set(true);
  }

  async logout(): Promise<void> {
    const confirmed = confirm('¿Estás seguro de que deseas cerrar sesión?');
    
    if (confirmed) {
      try {
        // Aquí iría la lógica de logout (limpiar tokens, etc.)
        await this.router.navigate(['/login']);
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    }
  }

  onMenuClick(item: MenuItem): void {
    this.collapseMenu(); // Colapsar menu en mobile después del click
    
    if (item.action) {
      item.action();
    }
  }
}