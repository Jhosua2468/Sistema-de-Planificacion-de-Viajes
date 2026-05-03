export class CreateExperienciaDto {
  resumen_experiencia!: string;
  fecha_viaje!: string;
  id_usuario!: number;
  id_destino!: number;

  costos!: {
    categoria: string;
    descripcion_gasto: string;
    monto: number;
  }[];
}
