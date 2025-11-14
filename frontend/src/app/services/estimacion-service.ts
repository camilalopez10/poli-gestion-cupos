import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EstimacionService {
  private baseUrl: string;
  constructor(private http: HttpClient) {
    const api = (environment.apiUrl || '').replace(/\/$/, '');
    this.baseUrl = api;
  }

  // list saved estimations
  list() {
    if (this.baseUrl) return this.http.get<any[]>(`${this.baseUrl}/api/getCuposEstimados`);
    return this.http.get<any[]>('php/estimacion_api.php?action=getCuposEstimados');
  }

  create(payload: any) {
    if (this.baseUrl) return this.http.post<any>(`${this.baseUrl}/api/createCupoEstimado`, payload);
    return this.http.post<any>('php/estimacion_api.php?action=createCupoEstimado', payload);
  }
}
