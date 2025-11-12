import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HistoricoService {
  private baseUrl: string;
  constructor(private http: HttpClient) {
    const api = (environment.apiUrl || '').replace(/\/$/, '');
    this.baseUrl = api;
  }

  // Fetch historical matriculas
  list() {
    if (this.baseUrl) return this.http.get<any[]>(`${this.baseUrl}/api/getMatriculasHistoricas`);
    return this.http.get<any[]>('php/historico_api.php?action=getMatriculasHistoricas');
  }
}
