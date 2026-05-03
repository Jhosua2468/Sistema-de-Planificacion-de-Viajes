import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  nombre!: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;

  // NUEVO: Foto de perfil opcional
  @IsOptional()
  @IsString()
  url_foto?: string;
}
