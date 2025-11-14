import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private baseUrl: string;

  constructor(private http: HttpClient) {
    const api = (environment.apiUrl || '').replace(/\/$/, '');
    this.baseUrl = api; // may be empty string for relative URLs
  }

  // List users: uses /api/getUsuarios as requested
  list() {
    const url = `${this.baseUrl}/api/getUsuarios`;
    return this.http.get<any[]>(url);
  }

  // Create a new user - backend endpoint name assumed; adjust if your API differs
  // Password is optional in the payload for now (security handled later)
  create(payload: { nombre: string; correo: string; rol: string; password: string }) {
    console.log('Creating user with payload:', payload);
    const url = `${this.baseUrl}/api/createUsuario`;
    return this.http.post<any>(url, payload);
  }

  // Update existing user - adjust endpoint if needed
  update(id: string, payload: { nombre: string; correo: string; rol: string; password?: string }) {
    const url = `${this.baseUrl}/api/updateUsuario/${encodeURIComponent(id)}`;
    return this.http.put<any>(url, payload);
  }

  // Delete user - adjust endpoint if needed
  delete(id: string) {
    const url = `${this.baseUrl}/api/deleteUsuario/${encodeURIComponent(id)}`;
    return this.http.delete<any>(url);
  }
}
