/**
 * Modelo para representar un aula. Incluye helper estático fromDto y
 * un método `fits` para saber si la capacidad cubre una demanda dada.
 */
export class Aula {
  nombre?: string | null;
  capacidad?: number | null;
  codigo?: string | null;
  ubicacion?: string | null;
  [key: string]: any;

  constructor(init?: Partial<Aula>) {
    if (init) Object.assign(this, init);
  }

  static fromDto(dto: any): Aula {
    if (!dto) return new Aula();
    return new Aula({
      nombre: dto.nombre || dto.name || null,
      capacidad: dto.capacidad != null ? Number(dto.capacidad) : null,
      codigo: dto.codigo || null,
      ubicacion: dto.ubicacion || dto.ubicacion_aula || null,
    });
  }

  fits(cupos: number): boolean {
    if (this.capacidad == null) return false;
    return Number(this.capacidad) >= Number(cupos);
  }
}
