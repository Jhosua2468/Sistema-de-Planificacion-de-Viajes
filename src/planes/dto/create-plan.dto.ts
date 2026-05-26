import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  nombre_viaje!: string;

  @IsString()
  @IsOptional()
  fecha_inicio!: string;

  @IsString()
  @IsOptional()
  fecha_fin!: string;

  @IsString()
  @IsOptional()
  visibilidad!: string;

  @IsString()
  @IsOptional()
  estado!: string;

  @IsNumber()
  @IsOptional()
  presupuesto_total_estimado!: number;

  @IsObject()
  usuario!: { id_u: number };

  // 💡 NUEVO: Permitimos recibir el ID de la ciudad de inicio
  @IsNumber()
  @IsOptional()
  id_origen?: number;
}
