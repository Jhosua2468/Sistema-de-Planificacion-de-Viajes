import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
  Delete,
} from '@nestjs/common';
import { ExperienciasService } from './experiencias.service';
import { CreateExperienciaDto } from './dto/create-experiencia.dto';
import { JwtAuthGuard } from '../usuarios/guards/jwt-auth.guard';

@Controller('experiencias')
export class ExperienciasController {
  constructor(private readonly experienciasService: ExperienciasService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createExperienciaDto: CreateExperienciaDto) {
    return this.experienciasService.create(createExperienciaDto);
  }

  // 💡 NUEVO: Obtener experiencias del usuario logueado
  @UseGuards(JwtAuthGuard)
  @Get('usuario/:id')
  findByUsuario(@Param('id') id: string) {
    return this.experienciasService.findByUsuario(+id);
  }

  @Get('destino/:id')
  findByDestino(@Param('id') id: string) {
    return this.experienciasService.findByDestino(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.experienciasService.findOne(+id);
  }

  // 💡 NUEVO: Ruta para actualizar una experiencia (protegida)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.experienciasService.update(+id, updateData);
  }

  // 💡 NUEVO: Ruta para eliminar una experiencia (protegida)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.experienciasService.remove(+id);
  }

  // Ruta protegida para el Admin
  @UseGuards(JwtAuthGuard)
  @Get()
  findAllAdmin() {
    return this.experienciasService.findAllAdmin();
  }
}
