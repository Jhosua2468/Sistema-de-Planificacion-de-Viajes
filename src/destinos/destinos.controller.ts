import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { DestinosService } from './destinos.service';
import { CreateDestinoDto } from './dto/create-destino.dto';
import { JwtAuthGuard } from '../usuarios/guards/jwt-auth.guard';
import { RolesGuard } from '../usuarios/guards/roles.guard';
import { Roles } from '../usuarios/decorators/roles.decorator';

@Controller('destinos')
export class DestinosController {
  constructor(private readonly destinosService: DestinosService) {}

  // 1. CREAR DESTINO (Protegido: requiere Token de usuario logueado)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createDestinoDto: CreateDestinoDto) {
    return this.destinosService.create(createDestinoDto);
  }

  // 2. VER CATÁLOGO (Público: no requiere token)
  @Get()
  findAll() {
    return this.destinosService.findAll();
  }

  // 3. OBTENER PRESUPUESTO (Público)
  @Get(':id/presupuesto')
  obtenerPresupuesto(@Param('id') id: string) {
    return this.destinosService.obtenerPresupuestoSugerido(+id);
  }

  // 4. APROBAR DESTINO (Protegido VIP: Solo administradores)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/aprobar')
  aprobarDestino(@Param('id') id: string) {
    return this.destinosService.aprobar(+id);
  }
}
