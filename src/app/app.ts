//=================[Importaciones]=========
import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from './components/navbar/navbar';
import { filter } from 'rxjs/operators';

//=================[Componente Principal de la App]=========
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  //=================[Propiedades de la App]=========
  protected readonly title = signal('Proyecto-Certificaciones');
  protected readonly showNavbar = signal(true);

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showNavbar.set(event.url !== '/login');
      });
  }
}
