import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AsignaturasService {
  private baseUrl: string;

  constructor(private http: HttpClient) {
    const api = (environment.apiUrl || '').replace(/\/$/, '');
    this.baseUrl = api;
  }

  // List all asignaturas (fallback to php endpoint if no baseUrl)
  list() {
    if (this.baseUrl) return this.http.get<any[]>(`${this.baseUrl}/api/getAsignaturas`);
    return this.http.get<any[]>('php/asignaturas_api.php?action=list');
  }

  // Get a single asignatura by code/id using new API route getAsignatura
  getAsignatura(codigo: string) {
    const url = this.baseUrl ? `${this.baseUrl}/api/getAsignatura/${encodeURIComponent(codigo)}` : `php/asignaturas_api.php?action=get&id=${encodeURIComponent(codigo)}`;
    return this.http.get<any>(url);
  }

  // Import preview - send file FormData
  importPreview(file: File) {
    const fd = new FormData();
    // Accept CSV or XLSX; backend should detect type based on file mimetype or extension
    fd.append('file', file);
    if (this.baseUrl) return this.http.post<any>(`${this.baseUrl}/api/importPreviewAsignaturas`, fd);
    return this.http.post<any>('php/import_preview_asignaturas.php', fd);
  }

  // Confirm import
  importConfirm(file: File) {
    const fd = new FormData();
    // backend should accept CSV or XLSX file
    fd.append('file', file);
    if (this.baseUrl) return this.http.post<any>(`${this.baseUrl}/api/importConfirmAsignaturas`, fd);
    return this.http.post<any>('php/import_confirm_asignaturas.php', fd);
  }

  // Create multiple asignaturas in bulk by sending an array of records
  // records: [{ codigo, nombre, creditos?, nivel? }]
  createBulk(records: Array<any>) {
    const url = this.baseUrl ? `${this.baseUrl}/api/createAsignaturas` : `php/asignaturas_api.php?action=create_bulk`;
    return this.http.post<any>(url, { records });
  }
}
