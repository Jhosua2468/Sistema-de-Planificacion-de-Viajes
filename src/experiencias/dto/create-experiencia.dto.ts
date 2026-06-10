import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class CostoDetalleDto {
  @IsString()
  categoria!: string;

  @IsString()
  descripcion_gasto!: string;

  @IsNumber()
  monto!: number;
}

export class CreateExperienciaDto {
  @IsString()
  @IsNotEmpty()
  resumen_experiencia!: string;

  @IsNumber()
  puntuacion!: number; // 💡 ¡Faltaba esto para las estrellas!

  @IsNumber()
  id_usuario!: number;

  @IsNumber()
  id_destino!: number;

  @IsOptional() // Opcional por si no envías fecha y quieres que la BD la ponga
  @IsString()
  fecha_viaje?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CostoDetalleDto)
  costos!: CostoDetalleDto[];
}
