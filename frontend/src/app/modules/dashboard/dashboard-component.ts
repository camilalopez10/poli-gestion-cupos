import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth-service';
import { AsignaturasComponent } from '../asignaturas/asignaturas-component';
import { HistoricoComponent } from '../historico/historico-component';
import { EstimacionComponent } from '../estimacion/estimacion-component';
import { UsuariosComponent } from '../usuarios/usuarios-component';
import { AulasComponent } from '../aulas/aulas-component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgIf, AsignaturasComponent, UsuariosComponent, AulasComponent, HistoricoComponent, EstimacionComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  userName: string = '';
  userRole: string = '';
  currentModule: string = 'inicio';
  isAdmin: any;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userName = user.nombre;
      this.userRole = user.rol;
      this.isAdmin = (this.userRole || '').toString().toLowerCase() === 'admin';
    }
  }

  loadModule(moduleName: string) {
    // prevent non-admin users from loading the Usuarios module
    if (moduleName === 'usuarios' && !this.isAdmin) {
      alert('Acceso denegado: requiere rol de administrador');
      return;
    }
    this.currentModule = moduleName;
  }

  logout() {
    this.authService.logout();
    window.location.reload(); // Vuelve a login
  }

  imgError(event: Event) {
    const el = event.target as HTMLImageElement;
    if (el) {
      el.onerror = null;
      el.src = '/assets/img/placeholder.svg';
    }
  }
}
