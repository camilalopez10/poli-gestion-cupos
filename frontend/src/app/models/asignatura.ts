/**
 * Modelo ligero para representar una asignatura dentro de la app.
 * Provee un constructor que acepta un Partial y un método estático `fromDto`
 * para mapear fácilmente objetos recibidos desde el backend.
 */
export class Asignatura {
  codigo?: string | null;
  codigo_asignatura?: string | null;
  nombre?: string | null;
  nombre_asignatura?: string | null;
  prerequisitos?: string[];
  matriculados?: number;
  aprobados?: number;
  // otros campos que puedan venir del backend
  [key: string]: any;

  constructor(init?: Partial<Asignatura>) {
    this.prerequisitos = [];
    if (init) Object.assign(this, init);
  }

  static fromDto(dto: any): Asignatura {
    if (!dto) return new Asignatura();
    const prereq = Array.isArray(dto.prerequisitos)
      ? dto.prerequisitos
      : dto.prerequisito
      ? [dto.prerequisito]
      : [];
    return new Asignatura({
      codigo: dto.codigo || dto.codigo_asignatura || null,
      codigo_asignatura: dto.codigo_asignatura || dto.codigo || null,
      nombre: dto.nombre || dto.nombre_asignatura || null,
      nombre_asignatura: dto.nombre_asignatura || dto.nombre || null,
      prerequisitos: prereq,
      matriculados: dto.matriculados != null ? Number(dto.matriculados) : undefined,
      aprobados: dto.aprobados != null ? Number(dto.aprobados) : undefined,
    });
  }

  getDisplayName(): string {
    return this.nombre || this.nombre_asignatura || this.codigo || '';
  }
}
