import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateDestinoDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  descripcion_general!: string;

  @IsNumber()
  id_dep!: number;

  // NUEVO: Un arreglo de URLs opcional
  @IsOptional()
  @IsArray()
  @IsString({ each: true }) // Cada elemento del arreglo debe ser un string
  imagenes_urls?: string[];
}
