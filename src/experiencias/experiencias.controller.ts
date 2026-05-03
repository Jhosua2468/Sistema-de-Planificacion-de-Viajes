import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ExperienciasService } from './experiencias.service';
import { CreateExperienciaDto } from './dto/create-experiencia.dto';
import { JwtAuthGuard } from '../usuarios/guards/jwt-auth.guard';

@Controller('experiencias') // Rutas empiezan con /experiencias
export class ExperienciasController {
  constructor(private readonly experienciasService: ExperienciasService) {}

  @UseGuards(JwtAuthGuard) // Protegemos esta ruta para que solo usuarios autenticados puedan acceder
  @Post() // Ruta: POST http://localhost:3000/experiencias
  create(@Body() createExperienciaDto: CreateExperienciaDto) {
    return this.experienciasService.create(createExperienciaDto);
  }

  //rutas se quedan sin guard para q sean públicas y los viajeros puedan leer las experiencias de otros sin necesidad de autenticarse
  @Get('destino/:id') // Ruta: GET http://localhost:3000/experiencias/destino/1
  findByDestino(@Param('id') id: string) {
    return this.experienciasService.findByDestino(+id);
  }

  @Get(':id') // Ruta: GET http://localhost:3000/experiencias/5
  findOne(@Param('id') id: string) {
    return this.experienciasService.findOne(+id);
  }
}
