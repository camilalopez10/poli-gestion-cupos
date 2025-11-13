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

  constructor(private svc: AsignaturasService) { }

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

    const idxCodigo = findIdx(['CÓDIGO', 'cod']);
    const idxNombre = findIdx(['ASIGNATURA', 'nombre', 'materia']);
    const idxCred = findIdx(['CRÉDITOS', 'crédit', 'cr']);
    const idxNivel = findIdx(['NIVEL']);

    const records: Array<{ codigo: string; nombre: string; creditos?: string; nivel?: string }> = [];
    console.log('Rows count:', rows.length);
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] || [];
      console.log('Processing row', i, row);
      if (!row || row.every((c: any) => c === undefined || ('' + c).trim() === '')) continue;
      const first = ('' + (row[0] || '')).trim();
      if (/prerequisito/i.test(first) || /prerequisitos/i.test(first)) continue;

      const codigo = ('' + (row[1] || '')).trim();
      const nombre = ('' + (row[2] || '')).trim();
      const creditos = ('' + (row[6] || '')).trim();;
      const nivel = ('' + (row[4] || '')).trim();;
      console.log('Parsed record', { codigo, nombre, creditos, nivel });
      if (codigo === "CÓDIGO" || nombre === "ASIGNATURA") continue;
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
    // Recompute which records would be inserted for the newly selected sheet
    this.recordsToInsert = this.computeRecordsFromPreview(this.preview);
  }

  async onConfirmImport() {
    if (!this.file) { alert('Selecciona un archivo CSV o XLSX'); return; }
    if (!confirm('Confirmar importación?')) return;

    // If we have a client-side parsed preview, build the records array from the active sheet,
    // remove duplicates, and send as bulk to createAsignaturas endpoint.
    if (this.parsedSheets && this.parsedSheets.length > 0) {
      try {
        // collect records from all parsed sheets
        const records: Array<any> = [];
        for (const sheet of this.parsedSheets) {
          const preview = { header: sheet?.rows[0] || [], rows: sheet?.rows?.slice(1) || [] };
          const recs = this.computeRecordsFromPreview(preview);
          if (Array.isArray(recs) && recs.length) records.push(...recs);
        }

        // remove duplicates by codigo (keep first occurrence)
        const seen = new Set<string>();
        const uniqueRecords = records.filter(r => {
          const key = (r.codigo || '').toString().trim();
          if (!key) return false;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        console.log('Unique records to insert', uniqueRecords);

        if (uniqueRecords.length === 0) { alert('No se detectaron registros válidos para insertar.'); return; }

        // send bulk create
        const res: any = await firstValueFrom(this.svc.createBulk(uniqueRecords));
        if (res.error?.message === 'Error: código duplicado') {
          alert('Error: código duplicado'); return;
        }
        if (!(res.message === 'Asignaturas creadas exitosamente')) { alert('Error importando: ' + (res?.message || 'Respuesta inesperada del servidor')); return; }
        this.importedList = res.inserted || uniqueRecords;
        alert('Importación completada. Filas insertadas: ' + this.importedList.length);
        this.previewVisible = false;
        this.file = undefined;
        this.parsedSheets = [];
        await this.fetchAsignaturas();
        return;
      } catch (e: any) {
        if (e.error.message.includes('código duplicado')) {
          alert('Error: código duplicado'); return;
        }
        alert('Error al procesar importación en cliente, intentando en servidor');
        // fallthrough to fallback below
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

