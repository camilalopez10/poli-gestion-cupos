// src/app/modules/dashboard/dashboard-module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard'; // componente standalone

@NgModule({
  imports: [
    CommonModule,
    DashboardComponent // ✅ Importamos el componente standalone
  ]
  // ❌ No declarations ni exports
})
export class DashboardModule {}
