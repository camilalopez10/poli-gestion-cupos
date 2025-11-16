import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AulasService } from '../../services/aulas-service';
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
  // form model for creating a new aula
  // capacidad starts as null so the "Crear" button stays disabled until the user enters a value
  newAula: { nombre: string; capacidad: number | null; ubicacion: string } = { nombre: '', capacidad: null, ubicacion: '' };

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
    this.editModel = { nombre: aula.nombre || '', capacidad: aula.capacidad || 0, ubicacion: aula.ubicacion || ''};
  }

  cancelEdit() {
    this.editingId = null;
    this.editModel = { nombre: '', capacidad: 0, ubicacion: '', tipo: '' };
  }

  async acceptEdit() {
    if (!this.editingId) return;

    // Validate edit model: all fields present and capacidad > 0
    const nombreEmpty = !this.editModel.nombre || ('' + this.editModel.nombre).trim() === '';
    const ubicEmpty = !this.editModel.ubicacion || ('' + this.editModel.ubicacion).trim() === '';
    const capRaw = this.editModel.capacidad;
    const capEmpty = (capRaw === null || capRaw === undefined || (('' + capRaw).trim() === ''));
    if (nombreEmpty || ubicEmpty || capEmpty) {
      this.showToast('Todos los campos son obligatorios');
      return;
    }

    const capNum = Number(capRaw);
    if (isNaN(capNum) || capNum <= 0) {
      this.showToast('La capacidad debe ser un número válido mayor que 0');
      return;
    }

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

  // create a new aula using the service
  /**
   * Validation message to show in the form UI.
   * Priority: empty fields -> capacity invalid
   */
  get validationMessage(): string | null {
    const nombre = (this.newAula.nombre || '').toString().trim();
    const ubic = (this.newAula.ubicacion || '').toString().trim();
    const capRaw = this.newAula.capacidad;
    const cap = Number(capRaw);

    // If any text field is empty, show required message
    if (!nombre || !ubic || capRaw === null || capRaw === undefined || ('' + capRaw).trim() === '') {
      return 'Todos los campos son obligatorios';
    }

    // Capacity must be a valid number > 0
    if (isNaN(cap) || cap <= 0) {
      return 'La capacidad debe ser un número válido mayor que 0';
    }

    return null;
  }

  get canCreate(): boolean {
    const nombre = (this.newAula.nombre || '').toString().trim();
    const ubic = (this.newAula.ubicacion || '').toString().trim();
    const cap = Number(this.newAula.capacidad);
    return !!nombre && !!ubic && !isNaN(cap) && cap > 0;
  }

  async createAula() {
    // final guard: mirror the disabled condition so createAula cannot run when fields are empty
    const nombreEmpty = !this.newAula.nombre || ('' + this.newAula.nombre).trim() === '';
    const ubicEmpty = !this.newAula.ubicacion || ('' + this.newAula.ubicacion).trim() === '';
    const capRaw = this.newAula.capacidad;
    const capEmpty = (capRaw === null || capRaw === undefined || (('' + capRaw).trim() === ''));
    if (nombreEmpty || ubicEmpty || capEmpty) {
      this.showToast('Todos los campos son obligatorios');
      return;
    }

    // numeric validation: capacity must be > 0
    const capNum = Number(this.newAula.capacidad);
    if (isNaN(capNum) || capNum <= 0) { this.showToast('Ingrese una capacidad válida'); return; }
    this.isSaving = true;
    try {
      if (this.loadingSvc) this.loadingSvc.show();
      // service expects tipo field as well; send empty string for tipo
      const payload: any = { nombre: this.newAula.nombre.trim(), capacidad: Number(this.newAula.capacidad), ubicacion: (this.newAula.ubicacion || '').trim(), tipo: '' };
      const res: any = await firstValueFrom(this.svc.create(payload));
      // handle success response
      if (res && (res.success === true || /cread/i.test(res.message || ''))) {
        this.showToast('Aula creada correctamente');
        await this.fetchAulas();
        this.clearNewAula();
      } else {
        this.showToast(res?.message || 'Respuesta inesperada al crear aula');
      }
    } catch (e) {
      console.error('Error creando aula', e);
      this.showToast('Error creando aula');
    } finally {
      this.isSaving = false;
      if (this.loadingSvc) this.loadingSvc.hide();
    }
  }

  clearNewAula() {
    this.newAula = { nombre: '', capacidad: null, ubicacion: '' };
  }
}
