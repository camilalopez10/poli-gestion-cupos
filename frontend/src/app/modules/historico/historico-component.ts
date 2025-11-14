import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoricoService } from '../../services/historico-service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf, FormsModule],
  templateUrl: './historico.html',
  styleUrls: ['./historico.css'],
})
export class HistoricoComponent implements OnInit {
  query = '';
  periodo = '';
  items: any[] = [];
  filtered: any[] = [];
  periodOptions: { value: string; label: string }[] = [];

  // chart data
  pieData: { label: string; value: number }[] = [];
  barData: { label: string; value: number }[] = [];
  showCharts = false;

  loading = false;

  constructor(private svc: HistoricoService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  async loadAll() {
    try {
      this.loading = true;
      const data = await firstValueFrom(this.svc.list());
      this.items = data || [];
      this.filtered = [...this.items];
      this.buildPeriodOptions();
    } catch (e) {
      console.error('Error loading historico', e);
      alert('Error cargando datos históricos');
    } finally {
      this.loading = false;
    }
  }

  buildPeriodOptions() {
    const set = new Map<string,string>();
    for (const r of this.items) {
      const key = `${r.anio}-${r.periodo}`;
      const label = `${r.anio} - ${r.periodo}`;
      if (!set.has(key)) set.set(key,label);
    }
    this.periodOptions = Array.from(set.entries()).map(([value,label])=>({ value, label }));
  }

  onSearch() {
    const q = this.query.trim().toLowerCase();
    const p = this.periodo.trim();
    this.filtered = this.items.filter(it => {
      const matchPeriod = !p || `${it.anio}-${it.periodo}` === p || it.periodo === p || String(it.anio) === p;
      const matchQuery = !q || ((it.codigo_asignatura||'') + ' ' + (it.nombre_asignatura||'')).toLowerCase().includes(q);
      return matchPeriod && matchQuery;
    });

    // build charts from filtered data
    if (this.filtered.length) {
      this.buildCharts();
      this.showCharts = true;
    } else {
      this.showCharts = false;
      this.pieData = [];
      this.barData = [];
    }
  }

  clear() {
    this.query = '';
    this.periodo = '';
    this.filtered = [...this.items];
    this.showCharts = false;
    this.pieData = [];
    this.barData = [];
  }

  buildCharts() {
    const totalMatriculados = this.filtered.reduce((s, r) => s + Number(r.matriculados || 0), 0);
    const aprobados = this.filtered.reduce((s, r) => s + Number(r.aprobados || 0), 0);
    const reprobados = this.filtered.reduce((s, r) => s + Number(r.reprobados || 0), 0);
    const cancelaciones = this.filtered.reduce((s, r) => s + Number(r.cancelaciones || 0), 0);

    this.pieData = [
      { label: 'Aprobados', value: aprobados },
      { label: 'Reprobados', value: reprobados },
      { label: 'Cancelaciones', value: cancelaciones },
    ];

    // barData for estudiantes especiales, transferencias, reingresos, atrasados (assuming fields exist)
    const transferInterna = this.filtered.reduce((s, r) => s + Number(r.transferencia_interna || 0), 0);
    const transferExterna = this.filtered.reduce((s, r) => s + Number(r.transferencia_externa || 0), 0);
    const reingresos = this.filtered.reduce((s, r) => s + Number(r.reingresos || 0), 0);
    const especiales = this.filtered.reduce((s, r) => s + Number(r.estudiantes_especiales || 0), 0);
    const atrasados = this.filtered.reduce((s, r) => s + Number(r.atrasados || 0), 0);

    this.barData = [
      { label: 'Transferencias internas', value: transferInterna },
      { label: 'Transferencias externas', value: transferExterna },
      { label: 'Reingresos', value: reingresos },
      { label: 'Estudiantes especiales', value: especiales },
      { label: 'Atrasados', value: atrasados },
    ];
  }

  // helper for pie colors
  pieColor(i: number) {
    const palette = ['#4caf50','#f44336','#ff9800','#2196f3','#9c27b0'];
    return palette[i % palette.length];
  }

  // compute SVG arc path for pie slice index
  calcArcPath(index: number) {
    const total = this.pieData.reduce((s, p) => s + (p.value || 0), 0);
    if (!total) return '';
    const startAngle = this.pieData.slice(0, index).reduce((s, p) => s + (p.value || 0)/total * Math.PI*2, 0);
    const slice = this.pieData[index];
    const angle = (slice.value || 0)/total * Math.PI*2;
    const endAngle = startAngle + angle;
    const r = 90;
    const large = angle > Math.PI ? 1 : 0;
    const start = { x: Math.cos(startAngle - Math.PI/2)*r, y: Math.sin(startAngle - Math.PI/2)*r };
    const end = { x: Math.cos(endAngle - Math.PI/2)*r, y: Math.sin(endAngle - Math.PI/2)*r };
    const d = `M 0 0 L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y} Z`;
    return d;
  }

  // position for pie label (percentage) at slice centroid
  calcArcLabelPos(index: number) {
    const total = this.pieData.reduce((s, p) => s + (p.value || 0), 0);
    if (!total) return { x: 0, y: 0, pct: 0 };
    const startAngle = this.pieData.slice(0, index).reduce((s, p) => s + (p.value || 0)/total * Math.PI*2, 0);
    const slice = this.pieData[index];
    const angle = (slice.value || 0)/total * Math.PI*2;
    const mid = startAngle + angle/2;
    const r = 90 * 0.6;
    const x = Math.cos(mid - Math.PI/2) * r;
    const y = Math.sin(mid - Math.PI/2) * r;
    const pct = total ? Math.round(((slice.value || 0) / total) * 100) : 0;
    return { x, y, pct };
  }

  percentFor(index: number) {
    const total = this.pieData.reduce((s, p) => s + (p.value || 0), 0);
    if (!total) return '0%';
    const v = this.pieData[index]?.value || 0;
    return Math.round((v / total) * 100) + '%';
  }

  // bar chart helpers
  maxBarValue() {
    return Math.max(1, ...this.barData.map(b => b.value || 0));
  }

  calcBarH(value: number) {
    const max = this.maxBarValue();
    const h = Math.round((value / max) * 200);
    return h;
  }

  calcBarY(value: number) {
    const h = this.calcBarH(value);
    return 200 - h;
  }

  barColor(i: number) {
    const palette = ['#3f51b5','#009688','#ff5722','#8bc34a','#607d8b'];
    return palette[i % palette.length];
  }
}
