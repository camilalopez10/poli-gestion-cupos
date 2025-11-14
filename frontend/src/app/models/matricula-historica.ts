/**
 * Representa una fila de histórico de matrículas para una asignatura en un periodo.
 * Incluye helper fromDto para normalizar datos desde el backend.
 */
export class MatriculaHistorica {
  codigo_asignatura?: string | null;
  anio?: number | null;
  periodo?: string | null;
  matriculados?: number | null;
  aprobados?: number | null;
  cancelaciones?: number | null;
  reprobados?: number | null;
  repitentes?: number | null;
  fecha?: string | null;
  // campo libre para mantener otros datos
  [key: string]: any;

  constructor(init?: Partial<MatriculaHistorica>) {
    if (init) Object.assign(this, init);
  }

  static fromDto(dto: any): MatriculaHistorica {
    if (!dto) return new MatriculaHistorica();
    return new MatriculaHistorica({
      codigo_asignatura: dto.codigo_asignatura || dto.codigo || dto.codigoAsignatura || null,
      anio: dto.anio != null ? Number(dto.anio) : null,
      periodo: dto.periodo != null ? String(dto.periodo) : null,
      matriculados: dto.matriculados != null ? Number(dto.matriculados) : null,
  aprobados: dto.aprobados != null ? Number(dto.aprobados) : null,
  cancelaciones: dto.cancelaciones != null ? Number(dto.cancelaciones) : (dto.cancelados != null ? Number(dto.cancelados) : null),
  reprobados: dto.reprobados != null ? Number(dto.reprobados) : (dto.reprobados_count != null ? Number(dto.reprobados_count) : null),
  repitentes: dto.repitentes != null ? Number(dto.repitentes) : null,
      fecha: dto.fecha || null,
    });
  }
}
