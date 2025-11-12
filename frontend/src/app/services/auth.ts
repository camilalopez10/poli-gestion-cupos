import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user: any = null;

  constructor(private http: HttpClient) {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.user = JSON.parse(storedUser);
      }
    }
  }

  async login(correo: string, password: string) {
    // Enviar como JSON para que Express (con express.json()) pueda parsearlo en req.body
    const payload = { correo, password };
    console.log('Attempting login with', payload);

    const url = environment.apiUrl ? `${environment.apiUrl}/api/loginUsuario` : '/api/loginUsuario';

    try {
      // HttpClient devuelve un Observable; convertimos a Promise con firstValueFrom
      // Enviamos JSON (Content-Type: application/json) para que el backend lo reciba en req.body
      const data = await firstValueFrom(this.http.post<any>(url, payload));
      console.log('Login response data:', data);

      if (data.message == 'Inicio de sesión exitoso') {
        console.log('Login successful, storing user data');
        this.user = data.usuario;
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(data.usuario));
        }
      }
      return data;
    } catch (err) {
      console.error('Login network error:', err);
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      return { message: 'NetworkError: ' + message } as any;
    }
  }

  getUser() {
    return this.user;
  }

  logout() {
    this.user = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }

  isLoggedIn(): boolean {
    return !!this.user;
  }
}
