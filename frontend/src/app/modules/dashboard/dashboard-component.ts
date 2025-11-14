import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service';
import { AsignaturasComponent } from '../asignaturas/asignaturas-component';
import { HistoricoComponent } from '../historico/historico-component';
import { EstimacionComponent } from '../estimacion/estimacion-component';
import { UsuariosComponent } from '../usuarios/usuarios-component';
import { AulasComponent } from '../aulas/aulas-component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AsignaturasComponent, UsuariosComponent, AulasComponent, HistoricoComponent, EstimacionComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  userName: string = '';
  userRole: string = '';
  currentModule: string = 'inicio';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userName = user.nombre;
      this.userRole = user.rol;
    }
  }

  loadModule(moduleName: string) {
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
