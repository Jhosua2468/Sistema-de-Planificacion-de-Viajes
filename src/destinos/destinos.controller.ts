import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { DestinosService } from './destinos.service';
import { JwtAuthGuard } from '../usuarios/guards/jwt-auth.guard';
import { RolesGuard } from '../usuarios/guards/roles.guard';
import { Roles } from '../usuarios/decorators/roles.decorator';

@Controller('destinos')
export class DestinosController {
  constructor(private readonly destinosService: DestinosService) {}

  // =======================================================
  // 🌟 SECCIÓN 1: ATRACTIVOS (Sub-rutas de /destinos)
  // =======================================================

  @Get('atractivos')
  findAllAtractivos() {
    return this.destinosService.findAllAtractivos();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('atractivos')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  createAtractivo(
    @Body() createData: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.destinosService.crearAtractivo(createData, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('atractivos/:id')
  updateAtractivo(@Param('id') id: string, @Body() updateData: any) {
    return this.destinosService.actualizarAtractivo(+id, updateData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('atractivos/:id')
  removeAtractivo(@Param('id') id: string) {
    return this.destinosService.eliminarAtractivo(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('atractivos/:id/imagenes')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async subirImagenAtractivo(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string; url_guardada: string }> {
    if (!file) throw new BadRequestException('No se adjuntó ningún archivo.');
    return this.destinosService.guardarUrlImagenAtractivo(
      +id,
      `/uploads/${file.filename}`,
    );
  }

  // =======================================================
  // 🌟 SECCIÓN 2: DESTINOS
  // =======================================================

  // RUTAS VIP PARA ADMIN
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/todos')
  findAllAdmin() {
    return this.destinosService.findAllAdmin();
  }

  // DETALLE PÚBLICO
  @Get('detalle/:id')
  findOne(@Param('id') id: string) {
    return this.destinosService.findOne(+id);
  }

  // PRESUPUESTO PÚBLICO
  @Get(':id/presupuesto')
  obtenerPresupuesto(@Param('id') id: string) {
    return this.destinosService.obtenerPresupuestoSugerido(+id);
  }

  // CATÁLOGO PÚBLICO
  @Get()
  findAll() {
    return this.destinosService.findAll();
  }

  // CREAR DESTINO (Todo en Uno: Texto + Foto)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  create(@Body() createData: any, @UploadedFile() file: Express.Multer.File) {
    // Llamamos al servicio actualizado que procesa todo junto
    return this.destinosService.create(createData, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/aprobar')
  aprobarDestino(@Param('id') id: string) {
    return this.destinosService.aprobar(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  updateDestino(
    @Param('id') id: string,
    @Body() updateData: Record<string, any>,
  ) {
    return this.destinosService.updateDestino(+id, updateData);
  }

  // =======================================================
  // 🌟 SECCIÓN 3: GESTIÓN DE FOTOS EXTRA (Galería)
  // =======================================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':id/imagenes')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async subirImagenDestino(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se adjuntó ningún archivo.');
    }
    const urlFisica = `/uploads/${file.filename}`;
    return this.destinosService.guardarUrlImagen(+id, urlFisica);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('imagenes/:idImg')
  eliminarImagen(@Param('idImg') idImg: string) {
    return this.destinosService.eliminarImagen(+idImg);
  }
}
