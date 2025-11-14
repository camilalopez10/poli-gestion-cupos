import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios-service';
import { LoadingService } from '../../services/loading.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf, FormsModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css'],
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];

  // form fields for create / edit
  nombre = '';
  correo = '';
  password = '';
  // default to docente as requested
  rol = 'docente';

  editingId: string | null = null;
  editingIndex: number | null = null;
  // inline edit model for table editing
  editModel: any = { nombre: '', correo: '', rol: 'docente', password: '' };

  loading = false;
  isCreating = false;
  toastMessage = '';
  private toastTimer: any = null;
  isSaving = false;

  // allow only elpoli.edu.co emails
  private correoPattern = /^[^\s@]+@elpoli\.edu\.co$/i;

  constructor(private usuariosSrv: UsuariosService, private loadingSvc: LoadingService) { }

  ngOnInit(): void {
    this.fetchUsuarios();
  }

  async fetchUsuarios() {
    this.loading = true;
    if (this.loadingSvc) this.loadingSvc.show();
    try {
      console.debug('[Usuarios] fetchUsuarios: requesting list');
      const res = await this.callWithTimeout(firstValueFrom(this.usuariosSrv.list()), 15000);
      console.log('Fetched usuarios', res);
      const anyRes: any = res;
      this.usuarios = Array.isArray(anyRes) ? anyRes : (anyRes?.data || []);
    } catch (err) {
      console.error('Error fetching usuarios', err);
      this.usuarios = [];
    } finally {
      this.loading = false;
      if (this.loadingSvc) this.loadingSvc.hide();
    }
  }

  resetForm() {
    this.nombre = '';
    this.correo = '';
    this.password = '';
    this.rol = 'docente';
  }

  async crearUsuario() {
    if (!this.nombre || !this.correo) {
      alert('Por favor complete nombre y correo');
      return;
    }
    if (!this.correoIsValid()) {
      alert('El correo debe terminar en @elpoli.edu.co');
      return;
    }
    try {
      this.isCreating = true;
      if (this.loadingSvc) this.loadingSvc.show();
      // intentionally not sending password in payload for now
      const payload = { nombre: this.nombre, correo: this.correo, rol: this.rol, password: this.password };
      console.debug('[Usuarios] crearUsuario: payload=', payload);
      const res: any = await this.callWithTimeout(firstValueFrom(this.usuariosSrv.create(payload)), 15000);
      console.debug('[Usuarios] crearUsuario: response=', res);

      // If backend returned the canonical success message, show toast and clear fields
      if (res && res.message === 'Usuario registrado exitosamente') {
        this.showToast('Usuario creado exitosamente');
        this.resetForm();
        await this.fetchUsuarios();
      } else {
        // fallback: still refresh list and reset form if creation appears successful
        await this.fetchUsuarios();
        this.resetForm();
        if (res && res.message) this.showToast(res.message);
      }
    } catch (err: any) {
      console.error('Error creating usuario', err);
      if (this.isDuplicateEmailError(err)) {
        this.showToast('Ya existe una cuenta con ese correo');
      } else {
        const msg = err?.error?.message || err?.message || 'Error creando usuario';
        this.showToast(msg);
      }
    } finally {
      this.isCreating = false;
      if (this.loadingSvc) this.loadingSvc.hide();
    }
  }

  correoIsValid(email?: string) {
    const e = (email ?? this.correo ?? '').toString().trim();
    return this.correoPattern.test(e);
  }

  showToast(msg: string, ms = 3000) {
    this.toastMessage = msg;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toastMessage = ''; this.toastTimer = null; }, ms);
  }

  startEdit(usuario: any, index: number) {
    this.editingId = usuario.id?.toString() ?? usuario.id_usuario?.toString() ?? null;
    this.editingIndex = index;
    // populate inline edit model; keep create form unchanged
    this.editModel = { nombre: usuario.nombre || '', correo: usuario.correo || '', rol: usuario.rol || usuario.tipo || 'docente', password: '' };
  }

  cancelEdit() {
    this.editingId = null;
    this.editingIndex = null;
    this.editModel = { nombre: '', correo: '', rol: 'docente' };
  }

  async acceptEdit() {
    if (!this.editingId) return;
    if (!this.editModel.nombre || !this.editModel.correo) {
      alert('Por favor complete nombre y correo');
      return;
    }
    if (!this.correoIsValid(this.editModel.correo)) {
      alert('El correo debe terminar en @elpoli.edu.co');
      return;
    }
    try {
      this.isSaving = true;
      const payload: any = { nombre: this.editModel.nombre, correo: this.editModel.correo, rol: this.editModel.rol };
      // include password only if user set a new one in the inline editor
      if (this.editModel.password) payload.password = this.editModel.password;

      if (this.loadingSvc) this.loadingSvc.show();
      console.debug('[Usuarios] acceptEdit: id=', this.editingId, 'payload=', payload);
      const res: any = await this.callWithTimeout(firstValueFrom(this.usuariosSrv.update(this.editingId, payload)), 15000);

      if (res && (res.success === true || res.message === 'Usuario actualizado exitosamente')) {
        console.debug('[Usuarios] acceptEdit: response=', res);
        const idStr = ('' + this.editingId).toString();
        const getId = (u: any) => ('' + (u.id || u.id_usuario || '')).toString();
        // If password was sent in payload, keep the actual (new) password locally so it shows in the table
        this.usuarios = this.usuarios.map(u => getId(u) === idStr ? { ...u, ...payload, password: payload.password ? payload.password : u.password } : u);
        this.showToast('Usuaaario actualizado correctamente');
        this.cancelEdit();
      } else {
        await this.fetchUsuarios();
        if (res && res.message) this.showToast(res.message);
        this.cancelEdit();
      }
    } catch (err: any) {
      console.error('Error updating usuario', err);
      if (this.isDuplicateEmailError(err)) {
        this.showToast('Ya existe una cuenta con ese correo');
      } else {
        const msg = err?.error?.message || err?.message || 'Error actualizando usuario';
        this.showToast(msg);
      }
    } finally {
      this.isSaving = false;
      if (this.loadingSvc) this.loadingSvc.hide();
    }
  }

  async eliminarUsuario(id: string) {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      if (this.loadingSvc) this.loadingSvc.show();
      await this.callWithTimeout(firstValueFrom(this.usuariosSrv.delete(id)), 15000);
      await this.fetchUsuarios();
      if (this.loadingSvc) this.loadingSvc.hide();
    } catch (err) {
      console.error('Error deleting usuario', err);
      alert('Error eliminando usuario');
      if (this.loadingSvc) this.loadingSvc.hide();
    }
  }

  // Utility: wrap a promise with a timeout to avoid indefinite hangs
  private callWithTimeout<T>(p: Promise<T>, ms = 15000): Promise<T> {
    let timeoutId: any;
    return Promise.race<T>([
      p,
      new Promise<T>((_res, rej) => {
        timeoutId = setTimeout(() => rej(new Error('timeout')), ms);
      }),
    ]).finally(() => clearTimeout(timeoutId));
  }

  // Detect duplicate-email errors from backend responses
  private isDuplicateEmailError(err: any): boolean {
    try {
      const payload = err?.error ?? err;
      const text = (payload?.error || payload?.message || err?.message || '').toString();
      // common MySQL duplicate error format contains "Duplicate entry" and the key name
      return /duplicate entry/i.test(text) && /correo|usuarios\.correo/i.test(text);
    } catch (e) {
      return false;
    }
  }
}
