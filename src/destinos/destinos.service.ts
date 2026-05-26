/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Importamos también Atractivo
import { Atractivo } from './entities/atractivo.entity';
import { Destino } from './entities/destino.entity';
import { EstadoAprobacion } from '../comun/enums/estado.enum';
import { Imagen } from '../comun/images/imagen.entity';

@Injectable()
export class DestinosService {
  constructor(
    @InjectRepository(Destino)
    private readonly destinoRepository: Repository<Destino>,

    @InjectRepository(Atractivo) // 💡 Inyectamos el repositorio de Atractivos
    private readonly atractivoRepository: Repository<Atractivo>,

    @InjectRepository(Imagen)
    private readonly imagenRepository: Repository<Imagen>,
  ) {}

  // ==========================================
  // 1. DESTINOS
  // ==========================================

  // CREAR DESTINO (TODO EN UNO: Datos + Foto Física)
  async create(data: any, file?: Express.Multer.File) {
    const nuevoDestino = this.destinoRepository.create({
      nombre: data.nombre,
      descripcion_general: data.descripcion_general,
      estado: data.estado || EstadoAprobacion.APROBADO,
      departamento: { id_dep: Number(data.id_dep) },
    });

    const destinoGuardado = await this.destinoRepository.save(nuevoDestino);

    // Si llegó una foto, la guardamos
    if (file) {
      const nuevaImagen = this.imagenRepository.create({
        url: `/uploads/${file.filename}`,
        destino: { id_d: destinoGuardado.id_d },
      });
      await this.imagenRepository.save(nuevaImagen);
    }

    return destinoGuardado;
  }

  // LISTAR TODOS LOS DESTINOS (Catálogo)
  async findAll() {
    return await this.destinoRepository.find({
      where: { estado: EstadoAprobacion.APROBADO },
      relations: ['departamento', 'atractivos', 'mesesIdeales', 'imagenes'],
    });
  }

  // CALCULAR PRESUPUESTO PROMEDIO
  async obtenerPresupuestoSugerido(id_destino: number) {
    const destino = await this.destinoRepository.findOne({
      where: { id_d: id_destino },
    });

    if (!destino) {
      throw new NotFoundException(`El destino con ID ${id_destino} no existe.`);
    }

    const resultadoPromedios: Array<{
      categoria: string;
      promedio_estimado: number;
    }> = await this.destinoRepository.query(
      `
      SELECT cd.categoria, ROUND(AVG(cd.monto), 2) as promedio_estimado
      FROM costos_detalle cd
      JOIN experiencias_u e ON cd.id_experiencia = e.id_exp
      WHERE e.id_destino = ?
      GROUP BY cd.categoria
      `,
      [id_destino],
    );

    return {
      destino: destino.nombre,
      desglose_promedio: resultadoPromedios,
    };
  }

  // APROBAR DESTINO
  async aprobar(id_destino: number) {
    const destino = await this.destinoRepository.findOne({
      where: { id_d: id_destino },
    });

    if (!destino) {
      throw new NotFoundException(`El destino con ID ${id_destino} no existe.`);
    }

    destino.estado = EstadoAprobacion.APROBADO;
    return await this.destinoRepository.save(destino);
  }

  // GUARDAR URL IMAGEN FÍSICA A DESTINO
  async guardarUrlImagen(id_destino: number, url: string) {
    const destino = await this.destinoRepository.findOne({
      where: { id_d: id_destino },
    });

    if (!destino) {
      throw new NotFoundException(`El destino con ID ${id_destino} no existe.`);
    }

    const nuevaImagen = this.imagenRepository.create({
      url: url,
      destino: destino,
    });

    await this.imagenRepository.save(nuevaImagen);
    return { message: 'Imagen física subida y enlazada', url_guardada: url };
  }

  // LISTAR TODOS (ADMIN)
  async findAllAdmin() {
    return await this.destinoRepository.find({
      relations: ['departamento', 'imagenes'],
    });
  }

  // ACTUALIZAR DESTINO
  async updateDestino(id_destino: number, updateData: Record<string, any>) {
    const destino = await this.destinoRepository.findOne({
      where: { id_d: id_destino },
    });

    if (!destino) {
      throw new NotFoundException('Destino no encontrado');
    }

    if (updateData.nombre) destino.nombre = updateData.nombre;
    if (updateData.descripcion_general)
      destino.descripcion_general = updateData.descripcion_general;
    if (updateData.estado) destino.estado = updateData.estado;

    return await this.destinoRepository.save(destino);
  }

  // ELIMINAR IMAGEN
  async eliminarImagen(id_img: number) {
    const imagen = await this.imagenRepository.findOne({
      where: { id_img: id_img },
    });
    if (!imagen) {
      throw new NotFoundException('Imagen no encontrada');
    }
    await this.imagenRepository.remove(imagen);
    return { message: 'Imagen borrada de la base de datos' };
  }

  // OBTENER DETALLE DESTINO
  async findOne(id_destino: number) {
    const destino = await this.destinoRepository.findOne({
      where: { id_d: id_destino },
      relations: [
        'departamento',
        'imagenes',
        'atractivos',
        'atractivos.imagenes',
        'mesesIdeales',
        'experiencias',
        'experiencias.usuario',
      ],
    });

    if (!destino) {
      throw new NotFoundException(`El destino con ID ${id_destino} no existe.`);
    }
    return destino;
  }

  // ==========================================
  // 2. ATRACTIVOS (Lógica Unificada)
  // ==========================================

  async findAllAtractivos() {
    return await this.atractivoRepository.find({
      relations: ['destino', 'imagenes'],
    });
  }

  // CREAR ATRACTIVO (TODO EN UNO)
  async crearAtractivo(data: any, file?: Express.Multer.File) {
    const nuevoAtractivo = this.atractivoRepository.create({
      nombre: data.nombre,
      descripcion: data.descripcion,
      estado: data.estado || EstadoAprobacion.APROBADO,
      destino: { id_d: Number(data.id_destino) },
    });

    const guardado = await this.atractivoRepository.save(nuevoAtractivo);

    if (file) {
      const nuevaImagen = this.imagenRepository.create({
        url: `/uploads/${file.filename}`,
        atractivo: { id_at: guardado.id_at },
      });
      await this.imagenRepository.save(nuevaImagen);
    }
    return guardado;
  }

  async actualizarAtractivo(id: number, updateData: any) {
    await this.atractivoRepository.update(id, {
      nombre: updateData.nombre,
      descripcion: updateData.descripcion,
      estado: updateData.estado,
    });
    return { success: true };
  }

  async eliminarAtractivo(id: number) {
    // 💡 Primero borramos sus imágenes por restricción de Llave Foránea
    await this.imagenRepository.delete({ atractivo: { id_at: id } });
    await this.atractivoRepository.delete(id);
    return { success: true };
  }
}
