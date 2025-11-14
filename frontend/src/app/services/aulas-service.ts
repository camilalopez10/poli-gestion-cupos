import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AulasService {
  private baseUrl: string;

  constructor(private http: HttpClient) {
    const api = (environment.apiUrl || '').replace(/\/$/, '');
    this.baseUrl = api;
  }

  list() {
    if (this.baseUrl) return this.http.get<any[]>(`${this.baseUrl}/api/getAulas`);
    return this.http.get<any[]>('php/aulas_api.php?action=list');
  }

  create(payload: { nombre: string; capacidad: number; ubicacion: string; tipo: string }) {
    if (this.baseUrl) return this.http.post<any>(`${this.baseUrl}/api/createAula`, payload);
    return this.http.post<any>('php/aulas_api.php?action=create', payload);
  }

  update(id: string, payload: { nombre?: string; capacidad?: number; ubicacion?: string; tipo?: string }) {
    if (this.baseUrl) return this.http.put<any>(`${this.baseUrl}/api/updateAula/${encodeURIComponent(id)}`, payload);
    return this.http.post<any>(`php/aulas_api.php?action=update&id=${encodeURIComponent(id)}`, payload);
  }

  delete(id: string) {
    if (this.baseUrl) return this.http.delete<any>(`${this.baseUrl}/api/deleteAula/${encodeURIComponent(id)}`, {});
    return this.http.post<any>(`php/aulas_api.php?action=delete&id=${encodeURIComponent(id)}`, {});
  }
}
