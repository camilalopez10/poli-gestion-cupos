import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'login-component',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule]
})
export class LoginComponent{
  correo = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}


  async login() {
   console.log('Intentando iniciar sesión con', this.correo, this.password);
    const res = await this.auth.login(this.correo, this.password);
    if (res.message == 'Inicio de sesión exitoso') {
      this.router.navigate(['/dashboard']);
    } else {
      alert(res.error || 'Usuario o contraseña incorrectos');
    }
  }

  resetPassword() {
    this.router.navigate(['/forgot-password']); // Ajusta la ruta según tu proyecto
  }
}
