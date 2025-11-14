import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsignaturasService } from '../../services/asignaturas-service';
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
    // keep a copy of the full items list for client-side search/filter
    itemsAll: any[] = [];
    loading = false;

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
    recordsToInsert: Array<{ codigo: string; nombre: string; creditos?: string; nivel?: string; prerequisito?: string; prerequisitos?: string }> = [];

    constructor(private svc: AsignaturasService) { }

    ngOnInit(): void {
        this.fetchAsignaturas();
    }

    async fetchAsignaturas() {
        console.debug('Fetching asignaturas...');
        this.loading = true;
        try {
            const res: any = await firstValueFrom(this.svc.list());
            console.log('Fetched asignaturas', res);
            this.items = Array.isArray(res) ? res : (res?.data || res || []);
            // keep a full copy for local filtering
            this.itemsAll = [...this.items];
        } catch (e) {
            console.error('Error fetching asignaturas', e);
            this.items = [];
        } finally {
            this.loading = false;
        }
    }

    // After importing, apply prerequisito information from the imported records
    applyImportedPrerequisitos(imported: Array<any> | undefined) {
        if (!imported || !Array.isArray(imported) || imported.length === 0) return;
        const map = new Map<string, any>();
        for (const r of imported) {
            const key = (r.codigo || r.code || r.id || '').toString().trim();
            if (!key) continue;
            map.set(key, r);
        }
        if (map.size === 0) return;
        // update current items and itemsAll
        const applyTo = (it: any) => {
            const key = (it.codigo || it.id || '').toString().trim();
            if (!key) return;
            const rec = map.get(key);
            if (!rec) return;
            if (rec.prerequisito) it.prerequisito = rec.prerequisito;
            if (rec.prerequisitos) it.prerequisitos = Array.isArray(rec.prerequisitos) ? rec.prerequisitos : rec.prerequisitos;
            // normalize prerequisito string
            if (!it.prerequisito && it.prerequisitos) it.prerequisito = it.prerequisitos.join ? it.prerequisitos.join(', ') : String(it.prerequisitos);
        };
        this.items = this.items.map(it => { applyTo(it); return it; });
        this.itemsAll = this.itemsAll.map(it => { applyTo(it); return it; });
    }

    onSubmit() {
        // perform client-side search/filter on already loaded items
        const qCodigo = (this.codigo || '').toString().trim().toLowerCase();
        const qNombre = (this.nombre || '').toString().trim().toLowerCase();

        // if no query provided, reset to full list
        if (!qCodigo && !qNombre) {
            this.items = [...this.itemsAll];
            return;
        }

        this.items = this.itemsAll.filter(it => {
            const codigo = ((it.codigo || it.id || '') + '').toString().toLowerCase();
            const nombre = ((it.nombre || it.nombre_asignatura || '') + '').toString().toLowerCase();
            const matchCodigo = qCodigo ? codigo.includes(qCodigo) : false;
            const matchNombre = qNombre ? nombre.includes(qNombre) : false;
            // if both queries provided, require both to match; otherwise match whichever is provided
            if (qCodigo && qNombre) return matchCodigo && matchNombre;
            return matchCodigo || matchNombre;
        });
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

        const idxCodigo = findIdx(['codigo', 'cod']);
        const idxNombre = findIdx(['asignatura', 'nombre', 'materia']);
        const idxCred = findIdx(['credit', 'crédit', 'cr']);
        const idxNivel = findIdx(['nivel']);

        const records: Array<any> = [];
        console.log('Rows count:', rows.length);
        let consecutiveEmpty = 0;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i] || [];
            console.log('Processing rowwww', i, row);
            if (row.length == 2) {
                console.debug('Skipping combined code-name header row (second col)', i, row);
                continue;
            }    
            const isEmptyRow = !row || row.every((c: any) => c === undefined || ('' + c).trim() === '');
            if (row.length === 0 || isEmptyRow) {
                consecutiveEmpty++;
                if (consecutiveEmpty > 10) {
                    console.debug('Stopping parse: more than 10 consecutive empty rows at index', i);
                    break;
                }
                continue;
            }
            consecutiveEmpty = 0;
            const first = ('' + (row[0] || '')).trim();
            const second = ('' + (row[1] || '')).trim();


            // If this row is a PREREQUISITOS row, attach its codes to the previous record
            if (/^\s*prerequisito?s?\s*$/i.test(first) || /prerequisito/i.test(first)) {
                // extract possible codes from the rest of the row
                // prefer idxCodigo if detected, otherwise try common columns
                const possibleCodeCols = [idxCodigo, 1, 0, 2];
                const codes: string[] = [];
                for (const col of possibleCodeCols) {
                    if (col == null || col < 0) continue;
                    const cell = ('' + (row[col] || '')).trim();
                    if (!cell) continue;
                    // split by commas/semicolons/space to allow multiple codes
                    const parts = cell.split(/[;,\s]+/).map((p: string) => p.trim()).filter((p: string) => p);
                    for (const p of parts) {
                        if (!p || /^[Cc][óo]digo$/i.test(p) || /prerequisito/i.test(p)) continue;
                        // sanitize code: pick the first token that looks like a code (letters/numbers, -, _, .)
                        const m = p.match(/[A-Za-z0-9_\-\.]+/);
                        if (m) codes.push(m[0]);
                    }
                }

                // keep only unique sanitized codes
                const uniqCodes: string[] = [];
                for (const c of codes) if (c && !uniqCodes.includes(c)) uniqCodes.push(c);

                if (uniqCodes.length > 0 && records.length > 0) {
                    const prev = records[records.length - 1];
                    // initialize prerequisitos as array if needed
                    if (!prev.prerequisitos) prev.prerequisitos = [];
                    for (const c of uniqCodes) if (!prev.prerequisitos.includes(c)) prev.prerequisitos.push(c);
                    // also keep a display-friendly string consisting only of codes
                    prev.prerequisito = (prev.prerequisitos || []).join(', ');
                }
                // skip adding this row as a standalone asignatura
                continue;
            }

            // parse normal asignatura row using detected indices with fallbacks
            const codigo = idxCodigo !== -1 ? ('' + (row[idxCodigo] || '')).trim() : ('' + (row[1] || row[0] || '')).trim();
            const nombre = idxNombre !== -1 ? ('' + (row[idxNombre] || '')).trim() : ('' + (row[2] || row[1] || '')).trim();
            const creditos = idxCred !== -1 ? ('' + (row[idxCred] || '')).trim() : ('' + (row[6] || '')).trim();
            const nivel = idxNivel !== -1 ? ('' + (row[idxNivel] || '')).trim() : ('' + (row[4] || '')).trim();
            console.log('Parsed record', { codigo, nombre, creditos, nivel });
            if (/^\s*codigo\s*$/i.test(codigo) || /^\s*asignatura\s*$/i.test(nombre)) continue;
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

                // prepare payload: ensure prerequisitos is an array of codes (only codes sent)
                const payloadRecords = uniqueRecords.map(r => {
                    const prs: string[] = [];
                    if (Array.isArray(r.prerequisitos)) {
                        for (const p of r.prerequisitos) if (p) prs.push(('' + p).trim());
                    } else if (r.prerequisito) {
                        const parts = ('' + r.prerequisito).split(/[;,\s]+/).map((s: string) => s.trim()).filter((s: string) => s);
                        prs.push(...parts);
                    }
                    // send only a single code string as 'prerequisito' (first found) per request
                    const prereqCode = prs.length > 0 ? prs[0] : '';
                    return { codigo: r.codigo, nombre: r.nombre, creditos: r.creditos, nivel: r.nivel, prerequisito: prereqCode };
                });

                // send bulk create
                const res: any = await firstValueFrom(this.svc.createBulk(payloadRecords));
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
                // apply prerequisitos from the imported list to the freshly fetched items for immediate visibility
                this.applyImportedPrerequisitos(this.importedList);
                return;
            } catch (e: any) {
                if (e.error.message.includes('código duplicado')) {
                    alert('Error: código duplicado'); return;
                }
                alert('Error al procesar importación en cliente, intentando en servidor');
                // fallthrough to fallback below
            }
        }

        // // fallback to server-side import if client-side parsing not used or failed
        // try {
        //     const res: any = await firstValueFrom(this.svc.importConfirm(this.file!));
        //     if (!res.success) { alert('Error importando: ' + (res.message || '')); return; }
        //     this.importedList = res.inserted || [];
        //     alert('Importación completada. Filas insertadas: ' + this.importedList.length);
        //     this.previewVisible = false;
        //     this.file = undefined;
        //     await this.fetchAsignaturas();
        //     this.applyImportedPrerequisitos(this.importedList);
        // } catch (e) { console.error(e); alert('Error al confirmar importación'); }
    }
}
