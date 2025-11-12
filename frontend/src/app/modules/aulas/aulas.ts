import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AulasService } from '../../services/aulas';
import { LoadingService } from '../../services/loading.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-aulas',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf, FormsModule],
  templateUrl: './aulas.html',
  styleUrls: ['./aulas.css'],
})
export class AulasComponent implements OnInit {
  nombre = '';
  items: any[] = [];
  allItems: any[] = [];

  editingId: string | null = null;
  editModel: any = { nombre: '', capacidad: 0, ubicacion: '', tipo: '' };

  loading = false;
  isSaving = false;
  toastMessage = '';
  private toastTimer: any = null;

  constructor(private svc: AulasService, private loadingSvc: LoadingService) { }

  ngOnInit(): void {
    this.fetchAulas();
  }

  async fetchAulas() {
    try {
      this.loading = true;
  if (this.loadingSvc) this.loadingSvc.show();
      const data = await firstValueFrom(this.svc.list());
      this.allItems = data || [];
      this.items = [...this.allItems];
    } catch (e) {
      console.error('Error cargando aulas', e);
      alert('Error cargando aulas');
    } finally {
      this.loading = false;
  if (this.loadingSvc) this.loadingSvc.hide();
    }
  }

  // filter locally by nombre
  onSearch() {
    const q = this.nombre.trim().toLowerCase();
    if (!q) { this.items = [...this.allItems]; return; }
    this.items = this.allItems.filter(a => ((a.nombre || '') + '').toLowerCase().includes(q));
  }

  startEdit(aula: any) {
    this.editingId = aula.id?.toString() ?? aula.id_aula?.toString() ?? null;
    this.editModel = { nombre: aula.nombre || '', capacidad: aula.capacidad || 0, ubicacion: aula.ubicacion || '', tipo: aula.tipo || '' };
  }

  cancelEdit() {
    this.editingId = null;
    this.editModel = { nombre: '', capacidad: 0, ubicacion: '', tipo: '' };
  }

  async acceptEdit() {
    if (!this.editingId) return;
    this.isSaving = true;
    try {
  if (this.loadingSvc) this.loadingSvc.show();
      const res: any = await firstValueFrom(this.svc.update(this.editingId, this.editModel));

      // If backend confirms success with the specific message, update locally and exit edit mode
      console.log('Update aula response', res.message);
      const okMessage = 'Aula actualizada exitosamente';
      if (res && (res.message === okMessage || res.success === true)) {

        const idStr = ('' + this.editingId).toString();
        const getId = (a: any) => ('' + (a.id || a.id_aula || '')).toString();

        this.allItems = this.allItems.map(a => getId(a) === idStr ? { ...a, ...this.editModel } : a);
        this.items = this.items.map(a => getId(a) === idStr ? { ...a, ...this.editModel } : a);

        // exit edit mode
        this.cancelEdit();
        this.showToast('Aula actualizada correctamente');
  this.isSaving = false;
  if (this.loadingSvc) this.loadingSvc.hide();
        return;
      }

      // fallback: if backend didn't return the expected message, refetch to ensure sync
      await this.fetchAulas();
      this.cancelEdit();
      if (res && res.message && res.message !== okMessage) {
        this.showToast(res.message);
      }
  this.isSaving = false;
  if (this.loadingSvc) this.loadingSvc.hide();
    } catch (e) {
      console.error('Error actualizando aula', e);
  this.showToast('Error actualizando aula');
  this.isSaving = false;
  if (this.loadingSvc) this.loadingSvc.hide();
    }
  }

  showToast(msg: string, ms = 3000) {
    this.toastMessage = msg;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toastMessage = ''; this.toastTimer = null; }, ms);
  }

  async eliminar(id: string) {
    if (!confirm('Eliminar aula?')) return;
    // optimistic UI: remove locally first for immediate feedback
    const prevAll = [...this.allItems];
    const prevItems = [...this.items];
    this.allItems = this.allItems.filter(a => ('' + (a.id || a.id_aula || '')).toString() !== ('' + id).toString());
    this.items = this.items.filter(a => ('' + (a.id || a.id_aula || '')).toString() !== ('' + id).toString());

    try {
  if (this.loadingSvc) this.loadingSvc.show();
  await firstValueFrom(this.svc.delete(id));
      // refresh to ensure server/DB state is in sync (in case of paging or server-side filtering)
      await this.fetchAulas();
  if (this.loadingSvc) this.loadingSvc.hide();
    } catch (e) {
      console.error('Error eliminando aula', e);
      // revert optimistic change
      this.allItems = prevAll;
      this.items = prevItems;
      alert('Error eliminando aula');
  if (this.loadingSvc) this.loadingSvc.hide();
    }
  }
}
