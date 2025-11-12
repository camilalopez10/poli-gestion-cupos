import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../services/loading.service';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="global-loading" *ngIf="loadingService.loading$ | async">
      <div class="overlay-backdrop"></div>
      <div class="overlay-content" role="status" aria-live="polite">
        <div class="overlay-spinner"></div>
        <div class="overlay-text">Cargando...</div>
      </div>
    </div>
  `,
  styles: [
    `
  .global-loading { position: fixed; inset: 0; z-index: 12000; pointer-events: auto; }
    .overlay-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.35); backdrop-filter: blur(1px); }
    .overlay-content { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: auto; display:flex; align-items:center; gap:12px; background: rgba(255,255,255,0.02); padding:14px 18px; border-radius:8px; color:#fff; }
    .overlay-spinner { width:28px; height:28px; border-radius:50%; border:3px solid rgba(255,255,255,0.18); border-top-color: #fff; animation: spin 0.8s linear infinite; }
    .overlay-text { font-weight:600; font-size:14px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `
  ]
})
export class LoadingOverlayComponent {
  constructor(public loadingService: LoadingService) {}
}
