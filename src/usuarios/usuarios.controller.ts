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
}
