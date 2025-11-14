import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstimacionService } from '../../services/estimacion-service';
import { HistoricoService } from '../../services/historico-service';
import { AsignaturasService } from '../../services/asignaturas-service';
import { Asignatura } from '../../models/asignatura';
import { Aula } from '../../models/aula';
import { MatriculaHistorica } from '../../models/matricula-historica';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-estimacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estimacion.html',
  styleUrls: ['./estimacion.css'],
})
export class EstimacionComponent implements OnInit {
  periodos: string[] = [];
  periodoSeleccionado = '';
  asignaturas: Asignatura[] = [];
  asignaturaSeleccionada: Asignatura | null = null;
  // search/filter for asignaturas select
  asignaturaFilter: string = '';

  // general form
  anioAcademico: number | null = null;
  periodo: string = '';

  // estimation mode: 'single' or 'all'
  estimateMode: 'single' | 'all' | null = null;

  // single-asignatura inputs
  inscritosPrev: number | null = null;
  tasaCrecimiento: number | null = null; // %
  tasaDesercion: number | null = null; // %
  repitentes: number | null = null;

  // bulk table rows (when estimating for all) - left empty for real data
  bulkRows: Array<any> = [];

  capacidadAula = 0;

  // results
  sugerido: number | null = null;
  finalAsignado: number | null = null;
  estimatedResults: Array<any> = [];

  // aulas catalog (predefinido) as model instances
  aulas: Aula[] = [
    new Aula({ nombre: 'Aula 101', capacidad: 30 }),
    new Aula({ nombre: 'Aula 102', capacidad: 40 }),
    new Aula({ nombre: 'Aula 201', capacidad: 50 }),
  ];

  historicoData: any[] = [];
  // historico mapeado a instancias de MatriculaHistorica
  historicoRecords: MatriculaHistorica[] = [];
  // mapa codigo -> registros ordenados por anio/periodo desc (más reciente primero)
  historicoMap: Record<string, MatriculaHistorica[]> = {};

  estimaciones: any[] = [];

  loading = false;
  showResults = false;

  constructor(private estimSrv: EstimacionService, private histSrv: HistoricoService, private asigSrv: AsignaturasService) {}

  ngOnInit(): void {
    console.debug('[Estimacion] ngOnInit - iniciar');
    this.loadInitials();
    this.loadEstimaciones();
  }

  // devuelve la lista filtrada por codigo o nombre (case-insensitive)
  get filteredAsignaturas(): Asignatura[] {
    const q = (this.asignaturaFilter || '').trim().toLowerCase();
    if (!q) return this.asignaturas;
    return this.asignaturas.filter(a => {
      const name = (a.getDisplayName() || '').toLowerCase();
      const code = (a.codigo || a.codigo_asignatura || '').toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }

  async loadInitials() {
    // load asignaturas and historico to build period list
    try {
      console.debug('[Estimacion] loadInitials - fetching asignaturas y historico');
      this.loading = true;
      const [asigs, hist] = await Promise.all([
        firstValueFrom(this.asigSrv.list()),
        firstValueFrom(this.histSrv.list())
      ]);
  this.asignaturas = (asigs || []).map((a: any) => Asignatura.fromDto(a));
  this.historicoData = hist || [];
  // map historico rows to MatriculaHistorica
  this.historicoRecords = (this.historicoData || []).map((h: any) => MatriculaHistorica.fromDto(h));
  this.buildHistoricoMap();
      console.debug('[Estimacion] loadInitials - asignaturas:', this.asignaturas.length, 'historico:', this.historicoData.length);
      // build period options from historico (unique {anio}-{periodo})
      const set = new Set<string>();
      for (const r of this.historicoData) set.add(`${r.anio}-${r.periodo}`);
      this.periodos = Array.from(set).sort();
    } catch (e) {
      console.error('[Estimacion] Error loading initials', e);
    } finally {
      this.loading = false;
    }
  }

  buildHistoricoMap() {
    this.historicoMap = {};
    for (const r of this.historicoRecords) {
      const raw = (r.codigo_asignatura || '').toString();
      const key = this.normalizeCode(raw);
      if (!key) continue;
      if (!this.historicoMap[key]) this.historicoMap[key] = [];
      this.historicoMap[key].push(r);
    }
    // ordenar por anio/periodo descendente para tener el registro más reciente primero
    for (const k of Object.keys(this.historicoMap)) {
      this.historicoMap[k].sort((a,b) => {
        const ay = Number(a.anio || 0), by = Number(b.anio || 0);
        if (ay !== by) return by - ay;
        const ap = String(a.periodo || ''), bp = String(b.periodo || '');
        return bp.localeCompare(ap);
      });
    }
    console.debug('[Estimacion] buildHistoricoMap keys=', Object.keys(this.historicoMap).length);
  }

  // normaliza un código para comparación: trim + uppercase
  normalizeCode(raw: string) {
    return (raw || '').toString().trim().toUpperCase();
  }

  // Agrega métricas agregadas a partir de todos los registros históricos de una asignatura
  // Devuelve { avgInscritos, avgCrecimientoPct, avgDesercionPct, avgReprobados }
  aggregateHistorico(code: string) {
    const key = this.normalizeCode(code || '');
    const rows = this.historicoMap[key] || [];
    if (!rows || rows.length === 0) return null;
    // avg inscritos
    const totalInscritos = rows.reduce((s, r) => s + (Number(r.matriculados || 0)), 0);
    const avgInscritos = totalInscritos / rows.length;
    // crecimiento: calcular porcentajes entre pares consecutivos (recent -> prev) y promediar
    const crecimientos: number[] = [];
    for (let i = 0; i < rows.length - 1; i++) {
      const cur = rows[i];
      const prev = rows[i + 1];
      if (prev.matriculados && Number(prev.matriculados) > 0 && cur.matriculados != null) {
        const pct = ((Number(cur.matriculados) - Number(prev.matriculados)) / Number(prev.matriculados)) * 100;
        crecimientos.push(pct);
      }
    }
    const avgCrecimientoPct = crecimientos.length ? (crecimientos.reduce((s, v) => s + v, 0) / crecimientos.length) : 0;
    // desercion: usar suma(cancelaciones) / suma(matriculados) * 100 si hay cancelaciones
    const totalCancel = rows.reduce((s, r) => s + (Number(r.cancelaciones || 0)), 0);
    const totalMat = rows.reduce((s, r) => s + (Number(r.matriculados || 0)), 0);
    const avgDesercionPct = totalMat > 0 ? (totalCancel / totalMat) * 100 : 0;
    // reprobados: promedio simple por registro (fallback a repitentes si no hay reprobados)
    const totalReprobados = rows.reduce((s, r) => s + (Number(r.reprobados != null ? r.reprobados : (r.repitentes != null ? r.repitentes : 0))), 0);
    const avgReprobados = rows.length ? Math.round(totalReprobados / rows.length) : 0;
    return { avgInscritos, avgCrecimientoPct, avgDesercionPct, avgReprobados };
  }

  async estimar() {
    console.debug('[Estimacion] estimar - modo=', this.estimateMode);
    // compute estimation depending on mode
    if (!this.estimateMode) { alert('Seleccione modo de estimación (por asignatura o para todas)'); return; }

    if (this.estimateMode === 'single') {
        if (!this.asignaturaSeleccionada) { alert('Seleccione una asignatura'); return; }
        // usar agregados de todo el histórico para los cálculos
        const code = this.asignaturaSeleccionada.codigo || this.asignaturaSeleccionada.codigo_asignatura || '';
        const agg = this.aggregateHistorico(code);
        if (agg) {
          console.debug('[Estimacion] estimar - agregados historico para', code, agg);
          // inscritosPrev debe ser la última cantidad registrada (most recent)
          const recent = this.historicoMap[this.normalizeCode(code)] && this.historicoMap[this.normalizeCode(code)][0];
          console.debug('Ultimos matriculaods:', recent);
          if (recent && recent.matriculados != null) {
            this.inscritosPrev = Number(recent.matriculados);
          } else {
            this.inscritosPrev = Math.round(agg.avgInscritos);
          }
          this.tasaCrecimiento = Math.round(agg.avgCrecimientoPct * 100) / 100;
          this.tasaDesercion = Math.round(agg.avgDesercionPct * 100) / 100;
          this.repitentes = Math.round(agg.avgReprobados);
        } else {
          console.debug('[Estimacion] estimar - no hay historico agregado para', code);
        }
      if (this.inscritosPrev == null) { alert('Ingrese el número de inscritos previos para la asignatura'); return; }
      // normalize inputs
      const inscritos = Number(this.inscritosPrev || 0);
      const crecimiento = Number(this.tasaCrecimiento || 0);
      const desercion = Number(this.tasaDesercion || 0);
      const rep = Number(this.repitentes || 0);
      console.debug('[Estimacion] single - inputs', { inscritos, crecimiento, desercion, rep, capacidadAula: this.capacidadAula });
      // compute cupos según fórmula requerida
      const cupos = this.computeCupos(inscritos, crecimiento, desercion, rep);
      console.debug('[Estimacion] single - cupos calculados =', cupos);
      // recomendación de aula
      const rec = this.recomendarAula(cupos);
      console.debug('[Estimacion] single - recomendacion', rec);
      this.sugerido = cupos;
      this.finalAsignado = rec.requiereDivision ? null : (this.capacidadAula && this.capacidadAula > 0 ? Math.min(this.capacidadAula, cupos) : cupos);
      this.estimatedResults = [{ asignatura: this.asignaturaSeleccionada.nombre || this.asignaturaSeleccionada.codigo, cupos, aula: rec.aula, capacidad: rec.capacidad, grupos: rec.grupos, requiereDivision: rec.requiereDivision, mensaje: rec.mensaje }];
      this.showResults = true;
      return;
    }

    if (this.estimateMode === 'all') {
      // build rows from bulkRows or map from asignaturas
      const rows = (this.bulkRows && this.bulkRows.length) ? this.bulkRows : this.asignaturas.map(a => {
        const code = a.codigo || a.codigo_asignatura || '';
        const agg = this.aggregateHistorico(code);
        if (agg) {
          // inscritos debe ser la última cantidad registrada si existe
          const recent = this.historicoMap[this.normalizeCode(code)] && this.historicoMap[this.normalizeCode(code)][0];
          const inscritos = (recent && recent.matriculados != null) ? Number(recent.matriculados) : Math.round(agg.avgInscritos);
          const crec = Math.round(agg.avgCrecimientoPct * 100) / 100;
          const deser = Math.round(agg.avgDesercionPct * 100) / 100;
          const repit = Math.round(agg.avgReprobados);
          return { asignatura: a.getDisplayName(), inscritos: inscritos != null ? Number(inscritos) : null, crecimiento: crec, desercion: deser, repitentes: repit };
        }
        // fallback: no historico agregado -> dejar campos vacíos para que el usuario complete
        return { asignatura: a.getDisplayName(), inscritos: null, crecimiento: 0, desercion: 0, repitentes: 0 };
      });
      console.debug('[Estimacion] all - filas a procesar:', rows.length);
      // validate no empty inscritos fields
      const missing = rows.map((r, i) => ({ idx: i, missing: (r.inscritos == null || r.inscritos === '') })).filter(x => x.missing);
      if (missing.length > 0) {
        console.debug('[Estimacion] all - filas faltantes inscritos:', missing);
        alert(`Hay filas con inscritos vacíos. Complete los inscritos en todas las filas o elimine las filas vacías antes de continuar.`);
        return;
      }
      // clear previous results
      this.estimatedResults = [];
      for (const r of rows) {
        const inscritos = Number(r.inscritos || 0);
        const crecimiento = Number(r.crecimiento || 0);
        const desercion = Number(r.desercion || 0);
        const rep = Number(r.repitentes || 0);
        const cupos = this.computeCupos(inscritos, crecimiento, desercion, rep);
        const rec = this.recomendarAula(cupos);
        console.debug('[Estimacion] all - fila', r.asignatura, 'inscritos', inscritos, 'cupos', cupos, 'rec', rec);
        this.estimatedResults.push({ asignatura: r.asignatura, cupos, aula: rec.aula, capacidad: rec.capacidad, grupos: rec.grupos, requiereDivision: rec.requiereDivision, mensaje: rec.mensaje });
      }
      this.showResults = true;
      return;
    }

    // fallback: previous behavior (keep compatibility)
    if (!this.periodoSeleccionado || !this.asignaturaSeleccionada) { alert('Seleccione periodo y asignatura'); return; }
    const prev = this.periodoAnterior(this.periodoSeleccionado);
    // filter historico for this asignatura and prev period
  const selected = this.asignaturaSeleccionada!;
  const asigCode = selected.codigo || selected.codigo_asignatura || '';
  const relevant = this.historicoData.filter(r => `${r.anio}-${r.periodo}` === prev && (r.codigo_asignatura == asigCode || (r.nombre_asignatura && r.nombre_asignatura === selected.nombre)));
    // simple estimation: use matriculados of previous period adjusted by approval rate
    const mat = relevant.reduce((s,r)=> s + Number(r.matriculados || 0), 0);
    const apr = relevant.reduce((s,r)=> s + Number(r.aprobados || 0), 0);
    const approvedRate = mat ? apr / mat : 0.6;
    const suggested = Math.round(mat * (1 + (1 - approvedRate) * 0.1));
    this.sugerido = suggested;
    // default final assigned is suggested but not exceed capacity if provided
    this.finalAsignado = this.capacidadAula && this.capacidadAula > 0 ? Math.min(this.capacidadAula, this.sugerido) : this.sugerido;
  }

  // execute the calculation (bound to Calcular Estimación button)
  calcularEstimacion() {
    console.debug('[Estimacion] calcularEstimacion invoked');
    // delegate to estimar() to compute and show results
    this.estimar();
  }

  // handler when asignatura is selected from the UI
  onAsignaturaSelected(selected: Asignatura | null) {
    this.asignaturaSeleccionada = selected;
    console.debug('[Estimacion] onAsignaturaSelected', selected && selected.getDisplayName());
    if (!selected) return;
    const rawCode = (selected.codigo || selected.codigo_asignatura || '').toString();
    const code = this.normalizeCode(rawCode);
    // preferir agregados calculados a partir de todo el histórico
    const agg = this.aggregateHistorico(code);
    if (agg) {
      // Para inscritosPrev usar el registro más reciente si existe
      const recent = this.historicoMap[this.normalizeCode(code)] && this.historicoMap[this.normalizeCode(code)][0];
      if (recent && recent.matriculados != null) {
        this.inscritosPrev = Number(recent.matriculados);
      } else {
        this.inscritosPrev = Math.round(agg.avgInscritos);
      }
      this.tasaCrecimiento = Math.round(agg.avgCrecimientoPct * 100) / 100;
      this.tasaDesercion = Math.round(agg.avgDesercionPct * 100) / 100;
      this.repitentes = Math.round(agg.avgReprobados);
      console.debug('[Estimacion] onAsignaturaSelected - precargado desde agregados historico', { code, agg });
      return;
    }

    // fallback: intentar encontrar un registro individual por código o por nombre
    let recent: MatriculaHistorica | null = null;
    if (code && this.historicoMap[code] && this.historicoMap[code].length > 0) {
      recent = this.historicoMap[code][0];
      console.debug('[Estimacion] onAsignaturaSelected - found historico by code', code);
    } else {
      const name = selected.getDisplayName() || '';
      const found = this.historicoRecords.find(h => {
        const display = (h['nombre_asignatura'] || h['nombre'] || '').toString();
        return display && display.toLowerCase() === name.toLowerCase();
      });
      if (found) {
        recent = found;
        console.debug('[Estimacion] onAsignaturaSelected - found historico by name', name);
      }
    }

    if (recent) {
      this.inscritosPrev = recent.matriculados ?? this.inscritosPrev;
      // compute crecimiento vs previous if exists in historicoMap
      const codeKey = this.normalizeCode((recent.codigo_asignatura || '').toString());
      if (codeKey && this.historicoMap[codeKey] && this.historicoMap[codeKey].length >= 2) {
        const prev = this.historicoMap[codeKey][1];
        if (prev.matriculados && recent.matriculados && prev.matriculados > 0) {
          this.tasaCrecimiento = Math.round(((Number(recent.matriculados) - Number(prev.matriculados)) / Number(prev.matriculados)) * 100 * 100) / 100;
        }
      }
      if (recent.matriculados != null && recent.cancelaciones != null && recent.matriculados > 0) {
        this.tasaDesercion = Math.round((Number(recent.cancelaciones) / Number(recent.matriculados)) * 100 * 100) / 100;
      }
      // preferir reprobados sobre repitentes si está disponible
      this.repitentes = (recent.reprobados != null ? Number(recent.reprobados) : (recent.repitentes != null ? Number(recent.repitentes) : this.repitentes ?? 0));
      console.debug('[Estimacion] single - precargado desde historico (fallback)', { code, inscritos: this.inscritosPrev, crecimiento: this.tasaCrecimiento, desercion: this.tasaDesercion, repitentes: this.repitentes });
    } else {
      console.debug('[Estimacion] onAsignaturaSelected - no historico encontrado para', selected.getDisplayName(), 'code=', code);
    }
  }

  periodoAnterior(periodo: string) {
    // As requested: use the same periodo but previous year
    // e.g., for 2025-2 -> 2024-2
    const [anioStr, perStr] = periodo.split('-');
    const anio = Number(anioStr) - 1;
    const per = perStr;
    return `${anio}-${per}`;
  }

  // calcula cupos según la fórmula requerida por el usuario
  computeCupos(inscritosPrev: number, crecimientoPct: number, desercionPct: number, repitentes: number) {
    console.debug('[Estimacion] computeCupos inputs', { inscritosPrev, crecimientoPct, desercionPct, repitentes });
    // cupos_estimados = inscritos_pasado + (inscritos_pasado * crecimiento/100)
    let cupos = inscritosPrev + (inscritosPrev * (crecimientoPct / 100));
    // cupos_estimados = cupos_estimados - (cupos_estimados * deserción/100)
    cupos = cupos - (cupos * (desercionPct / 100));
    // cupos_estimados = cupos_estimados + repitentes
    cupos = cupos + repitentes;
    // redondear al entero más cercano
    const rounded = Math.max(0, Math.round(cupos));
    console.debug('[Estimacion] computeCupos result', rounded);
    return rounded;
  }

  // recomendar aula según cupos: busca aula más pequeña que cubra la demanda
  recomendarAula(cuposEstimados: number) {
    console.debug('[Estimacion] recomendarAula - cuposEstimados=', cuposEstimados, 'aulas disponibles=', this.aulas.length);
  const sorted = [...this.aulas].sort((a, b) => (Number(a.capacidad || 0) - Number(b.capacidad || 0)));
    // aula que iguala o supera cupos con menor capacidad posible
  const suitable = sorted.find(a => (a.capacidad != null) && (Number(a.capacidad) >= cuposEstimados));
    if (suitable) {
      console.debug('[Estimacion] recomendarAula - suitable', suitable);
      return { aula: suitable.nombre, capacidad: suitable.capacidad, grupos: 1, requiereDivision: false, mensaje: `Aula sugerida: ${suitable.nombre} (${suitable.capacidad} estudiantes)` };
    }
    // ninguna aula soporta: usar la más grande y calcular grupos
  const largest = sorted[sorted.length - 1];
  const grupos = Math.ceil(cuposEstimados / (Number(largest?.capacidad || 1)));
    console.debug('[Estimacion] recomendarAula - none suitable, largest=', largest, 'grupos=', grupos);
    return { aula: largest ? largest.nombre : 'N/A', capacidad: largest ? largest.capacidad : null, grupos, requiereDivision: true, mensaje: `Esta asignatura supera todas las aulas → Se proponen ${grupos} grupos.` };
  }

  async guardar() {
    if (this.finalAsignado == null) { alert('No hay un cupo asignado'); return; }
    if (!this.asignaturaSeleccionada) { alert('Seleccione una asignatura antes de guardar'); return; }
    const payload = {
      codigo_asignatura: this.asignaturaSeleccionada!.codigo || this.asignaturaSeleccionada!.codigo_asignatura,
      anio: Number(this.periodoSeleccionado.split('-')[0]),
      periodo: this.periodoSeleccionado.split('-')[1],
      cupos_calculados: this.finalAsignado,
      fecha: new Date().toISOString()
    };
    try {
      console.debug('[Estimacion] guardar - payload', payload);
      await firstValueFrom(this.estimSrv.create(payload));
      alert('La estimación se ha guardado correctamente');
      this.loadEstimaciones();
    } catch (e) { console.error('Error saving estimation', e); alert('Error guardando estimación'); }
  }

  async loadEstimaciones() {
    try {
      console.debug('[Estimacion] loadEstimaciones - fetching');
      const data = await firstValueFrom(this.estimSrv.list());
      this.estimaciones = data || [];
      console.debug('[Estimacion] loadEstimaciones - count', this.estimaciones.length);
    } catch (e) { console.error('Error loading estimaciones', e); }
  }

  cancelar() {
    this.sugerido = null;
    this.finalAsignado = null;
    this.showResults = false;
    console.debug('[Estimacion] cancelar - limpiar resultados');
  }
}
