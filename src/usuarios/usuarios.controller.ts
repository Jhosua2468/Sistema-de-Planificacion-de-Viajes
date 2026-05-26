import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { LoginDto } from './dto/login.dto';

@Controller('usuarios') // Las URLs empezarán con http://localhost:3000/usuarios
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post('registro') // URL: POST /usuarios/registro
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }
  @Post('login') // URL: POST http://localhost:3000/usuarios/login
  login(@Body() loginDto: LoginDto) {
    return this.usuariosService.login(loginDto.email, loginDto.password);
  }

  @Get() // URL: GET /usuarios
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id') // URL: GET /usuarios/1
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(+id);
  }

  // CAMBIAR LA CONTRASEÑA
  @Post('resetear-password')
  async resetearPassword(
    @Body() datos: { email: string; codigo: string; nuevaPassword: string },
  ) {
    return this.usuariosService.resetearPasswordConCodigo(
      datos.email,
      datos.codigo,
      datos.nuevaPassword,
    );
  }

  // SOLICITAR RECUPERACIÓN DE CONTRASEÑA (CORREO REAL)
  @Post('recuperar-password')
  async solicitarRecuperacion(@Body('email') email: string) {
    const usuario = await this.usuariosService.findByEmail(email);
    if (!usuario) {
      return { message: 'Si el correo existe, enviaremos un código.' };
    }

    // 1. Generamos el PIN de 6 dígitos
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Lo guardamos en la base de datos
    await this.usuariosService.guardarCodigoRecuperacion(usuario.id_u, pin);

    // 3. ENVIAMOS EL CORREO REAL
    await this.usuariosService.enviarCorreoRecuperacion(usuario.email, pin);

    // 4. Respondemos al frontend (Ya no mandamos el PIN de vuelta por seguridad)
    return {
      message: 'Código generado y enviado al correo con éxito',
    };
  }
}
