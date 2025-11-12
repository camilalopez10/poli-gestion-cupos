import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsignaturasService } from '../../services/asignaturas';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-asignaturas',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf, FormsModule],
  templateUrl: './asignaturas.html',
  styleUrls: ['./asignaturas.css'],
})
export class AsignaturasComponent implements OnInit {
  items: any[] = [];

  // form fields
  codigo = '';
  nombre = '';

  // file / preview state
  file?: File;
  previewVisible = false;
  preview: any = { header: [], rows: [] };
  parsedSheets: Array<any> = [];
  activeSheetIndex = 0;
  importedList: any[] = [];
  // records that will be inserted on confirm (computed from parsed preview)
  recordsToInsert: Array<{ codigo: string; nombre: string; creditos?: string; nivel?: string }> = [];

  constructor(private svc: AsignaturasService) {}

  ngOnInit(): void {
    this.fetchAsignaturas();
  }

  async fetchAsignaturas() {
    try {
      const res: any = await firstValueFrom(this.svc.list());
      this.items = Array.isArray(res) ? res : (res?.data || res || []);
    } catch (e) {
      console.error('Error fetching asignaturas', e);
      this.items = [];
    }
  }

  onSubmit() {
    // simple filter is left as future improvement; for now just refetch
    this.fetchAsignaturas();
  }

  onFileChange(ev: any) {
    const f = ev?.target?.files?.[0];
    if (!f) return;
    this.file = f;
  }
  onDelete(codigo: string) {
    if (!codigo) return;
    if (!confirm('¿Confirmar eliminación de asignatura?')) return;
    // Optimistic UI update: remove locally first for immediate feedback
    const prevItems = [...this.items];
    this.items = this.items.filter(i => ('' + (i.codigo || i.id || '')).trim() !== ('' + codigo).trim());

    this.svc.delete(codigo).subscribe({
      next: (res: any) => {
        if (res && (res.message === 'Registro eliminado exitosamente' || res.success || res.ok || res === true)) {
          // successful, nothing to do (already removed)
        } else {
          // server responded but indicates failure — revert UI and show message
          this.items = prevItems;
          alert('Error eliminando asignatura: ' + (res?.message || 'Respuesta inesperada del servidor'));
        }
      },
      error: (err) => {
        console.error('Error deleting asignatura', err);
        // revert optimistic change
        this.items = prevItems;
        alert('Error eliminando asignatura');
      }
    });
  }

  async onPreview() {
    if (!this.file) { alert('Selecciona un archivo primero'); return; }

    // try client-side parse with xlsx library
    try {
      const XLSX: any = await import('xlsx');
      const data = await this.file.arrayBuffer();
      const wb = XLSX.read(data, { type: 'array' });
      const sheets = wb.SheetNames.map((name: string) => ({ name, rows: XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1 }) }));
      this.parsedSheets = sheets;
      this.activeSheetIndex = 0;
      const first = sheets[0];
      this.preview = { header: first?.rows?.[0] || [], rows: first?.rows?.slice(1) || [] };
      this.previewVisible = true;
      // compute records to insert from parsed preview
      this.recordsToInsert = this.computeRecordsFromPreview(this.preview);
    } catch (e) {
      console.warn('Client-side XLSX preview failed, falling back to server preview', e);
      // Fallback: call server preview endpoint
      try {
        const res: any = await firstValueFrom(this.svc.importPreview(this.file));
        if (!res.success) { alert('Error en preview: ' + (res.message || '')); return; }
        this.preview = res;
        this.previewVisible = true;
      } catch (err) { console.error(err); alert('Error en preview'); }
    }
  }

  computeRecordsFromPreview(preview: any) {
    const rows = (preview?.rows || []) as any[][];
    // attempt to detect header and map columns
    const headerIndex = 0; // preview.rows already slices header off; header is in preview.header
    const headerRow: string[] = (preview?.header || []).map((h: any) => ('' + (h || '')).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase());
    const findIdx = (keys: string[]) => {
      for (let i = 0; i < headerRow.length; i++) {
        const h = headerRow[i];
        if (!h) continue;
        for (const k of keys) if (h.includes(k)) return i;
      }
      return -1;
    };

    const idxCodigo = findIdx(['codigo', 'cod']);
    const idxNombre = findIdx(['asignatura', 'nombre', 'materia']);
    const idxCred = findIdx(['credit', 'crédit', 'cr']);
    const idxNivel = findIdx(['nivel']);

    const records: Array<{ codigo: string; nombre: string; creditos?: string; nivel?: string }> = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] || [];
      if (!row || row.every((c: any) => c === undefined || ('' + c).trim() === '')) continue;
      const first = ('' + (row[0] || '')).trim();
      if (/prerequisito/i.test(first) || /prerequisitos/i.test(first)) continue;

      const codigo = idxCodigo !== -1 ? ('' + (row[idxCodigo] || '')).trim() : ('' + (row[0] || '')).trim();
      const nombre = idxNombre !== -1 ? ('' + (row[idxNombre] || '')).trim() : ('' + (row[1] || '')).trim();
      const creditos = idxCred !== -1 ? ('' + (row[idxCred] || '')).trim() : '';
      const nivel = idxNivel !== -1 ? ('' + (row[idxNivel] || '')).trim() : '';

      if (!codigo || !nombre) continue;
      records.push({ codigo, nombre, creditos, nivel });
    }
    return records;
  }

  cancelPreview() {
    this.previewVisible = false;
    this.parsedSheets = [];
    this.preview = { header: [], rows: [] };
    this.recordsToInsert = [];
  }

  selectSheet(i: number) {
    this.activeSheetIndex = i;
    const sheet = this.parsedSheets[i];
    this.preview = { header: sheet?.rows[0] || [], rows: sheet?.rows.slice(1) || [] };
  }

  async onConfirmImport() {
    if (!this.file) { alert('Selecciona un archivo CSV o XLSX'); return; }
    if (!confirm('Confirmar importación?')) return;

    // If we have a client-side parsed preview, use it to extract rows and create asignaturas
    if (this.parsedSheets && this.parsedSheets.length > 0) {
      try {
        const sheet = this.parsedSheets[this.activeSheetIndex] || this.parsedSheets[0];
        const rows = sheet?.rows || [];
        
        // find header row index by detecting a cell that contains 'codigo' (case-insensitive)
        const headerIndex = rows.findIndex((r: any[]) => Array.isArray(r) && r.some(c => ('' + (c || '')).toLowerCase().includes('codigo')));
        if (headerIndex === -1) {
          // fallback to server upload if we can't detect header
          const res: any = await firstValueFrom(this.svc.importConfirm(this.file));
          if (!res.success) { alert('Error importando: ' + (res.message || '')); return; }
          this.importedList = res.inserted || [];
          alert('Importación completada. Filas insertadas: ' + this.importedList.length);
          this.previewVisible = false;
          this.file = undefined;
          this.fetchAsignaturas();
          return;
        }

        const headerRow: string[] = (rows[headerIndex] || []).map((h: any) => ('' + (h || '')).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase());
        const findIdx = (keys: string[]) => {
          for (let i = 0; i < headerRow.length; i++) {
            const h = headerRow[i];
            if (!h) continue;
            for (const k of keys) if (h.includes(k)) return i;
          }
          return -1;
        };

        const idxCodigo = findIdx(['codigo', 'cod']);
        const idxNombre = findIdx(['asignatura', 'nombre', 'materia']);
        const idxCred = findIdx(['credit', 'crédit', 'cr']);
        const idxNivel = findIdx(['nivel']);

        const records: Array<{ codigo: string; nombre: string; creditos?: string; nivel?: string }> = [];

        for (let i = headerIndex + 1; i < rows.length; i++) {
          const row = rows[i] || [];
          // skip empty rows
          if (!row || row.every((c: any) => c === undefined || ('' + c).trim() === '')) continue;
          const first = ('' + (row[0] || '')).trim();
          // skip PREREQUISITOS blocks or similar section headers
          if (/prerequisito/i.test(first) || /prerequisitos/i.test(first)) continue;

          const codigo = idxCodigo !== -1 ? ('' + (row[idxCodigo] || '')).trim() : ('' + (row[0] || '')).trim();
          const nombre = idxNombre !== -1 ? ('' + (row[idxNombre] || '')).trim() : ('' + (row[1] || '')).trim();
          const creditos = idxCred !== -1 ? ('' + (row[idxCred] || '')).trim() : '';
          const nivel = idxNivel !== -1 ? ('' + (row[idxNivel] || '')).trim() : '';

          if (!codigo || !nombre) continue;
          records.push({ codigo, nombre, creditos, nivel });
        }

        // create records sequentially to avoid overloading backend
        const inserted: Array<any> = [];
        for (const rec of records) {
          try {
            const res: any = await firstValueFrom(this.svc.create(rec.codigo, rec.nombre));
            if (res && (res.success || res.ok)) inserted.push(rec);
          } catch (e) {
            console.error('Error creating asignatura', rec, e);
          }
        }

        this.importedList = inserted;
        alert('Importación completada. Filas insertadas: ' + inserted.length);
        this.previewVisible = false;
        this.file = undefined;
        this.parsedSheets = [];
        await this.fetchAsignaturas();
        return;
      } catch (e) {
        console.error(e);
        alert('Error al procesar importación en cliente, intentando en servidor');
        // fallthrough to server fallback
      }
    }

    // fallback to server-side import if client-side parsing not used or failed
    try {
      const res: any = await firstValueFrom(this.svc.importConfirm(this.file!));
      if (!res.success) { alert('Error importando: ' + (res.message || '')); return; }
      this.importedList = res.inserted || [];
      alert('Importación completada. Filas insertadas: ' + this.importedList.length);
      this.previewVisible = false;
      this.file = undefined;
      this.fetchAsignaturas();
    } catch (e) { console.error(e); alert('Error al confirmar importación'); }
  }
}

