import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstimacionService } from '../../services/estimacion';
import { HistoricoService } from '../../services/historico';
import { AsignaturasService } from '../../services/asignaturas';
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

  asignaturas: any[] = [];
  asignaturaSeleccionada: any = null;

  capacidadAula = 0;

  sugerido: number | null = null;
  finalAsignado: number | null = null;

  historicoData: any[] = [];

  estimaciones: any[] = [];

  loading = false;

  constructor(private estimSrv: EstimacionService, private histSrv: HistoricoService, private asigSrv: AsignaturasService) {}

  ngOnInit(): void {
    this.loadInitials();
    this.loadEstimaciones();
  }

  async loadInitials() {
    // load asignaturas and historico to build period list
    try {
      this.loading = true;
      const [asigs, hist] = await Promise.all([
        firstValueFrom(this.asigSrv.list()),
        firstValueFrom(this.histSrv.list())
      ]);
  this.asignaturas = asigs || [];
      this.historicoData = hist || [];
      // build period options from historico (unique {anio}-{periodo})
      const set = new Set<string>();
      for (const r of this.historicoData) set.add(`${r.anio}-${r.periodo}`);
      this.periodos = Array.from(set).sort();
    } catch (e) {
      console.error('Error loading initials', e);
    } finally {
      this.loading = false;
    }
  }

  async estimar() {
    if (!this.periodoSeleccionado || !this.asignaturaSeleccionada) { alert('Seleccione periodo y asignatura'); return; }
    // compute previous period to use historical records (user requested previous period logic)
    const prev = this.periodoAnterior(this.periodoSeleccionado);
    // filter historico for this asignatura and prev period
    const asigCode = this.asignaturaSeleccionada.codigo || this.asignaturaSeleccionada.codigo_asignatura || '';
    const relevant = this.historicoData.filter(r => `${r.anio}-${r.periodo}` === prev && (r.codigo_asignatura == asigCode || (r.nombre_asignatura && r.nombre_asignatura === this.asignaturaSeleccionada.nombre)));
    // simple estimation: use matriculados of previous period adjusted by approval rate
    const mat = relevant.reduce((s,r)=> s + Number(r.matriculados || 0), 0);
    const apr = relevant.reduce((s,r)=> s + Number(r.aprobados || 0), 0);
    const approvedRate = mat ? apr / mat : 0.6;
    const suggested = Math.round(mat * (1 + (1 - approvedRate) * 0.1));
    this.sugerido = suggested;
    // default final assigned is suggested but not exceed capacity if provided
    this.finalAsignado = this.capacidadAula && this.capacidadAula > 0 ? Math.min(this.capacidadAula, this.sugerido) : this.sugerido;
  }

  periodoAnterior(periodo: string) {
    // As requested: use the same periodo but previous year
    // e.g., for 2025-2 -> 2024-2
    const [anioStr, perStr] = periodo.split('-');
    const anio = Number(anioStr) - 1;
    const per = perStr;
    return `${anio}-${per}`;
  }

  async guardar() {
    if (this.finalAsignado == null) { alert('No hay un cupo asignado'); return; }
    const payload = {
      codigo_asignatura: this.asignaturaSeleccionada.codigo || this.asignaturaSeleccionada.codigo_asignatura,
      anio: Number(this.periodoSeleccionado.split('-')[0]),
      periodo: this.periodoSeleccionado.split('-')[1],
      cupos_calculados: this.finalAsignado,
      fecha: new Date().toISOString()
    };
    try {
      await firstValueFrom(this.estimSrv.create(payload));
      alert('La estimación se ha guardado correctamente');
      this.loadEstimaciones();
    } catch (e) { console.error('Error saving estimation', e); alert('Error guardando estimación'); }
  }

  async loadEstimaciones() {
    try {
      const data = await firstValueFrom(this.estimSrv.list());
      this.estimaciones = data || [];
    } catch (e) { console.error('Error loading estimaciones', e); }
  }

  cancelar() {
    this.sugerido = null;
    this.finalAsignado = null;
  }
}
