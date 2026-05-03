import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExperienciaDto } from './dto/create-experiencia.dto';
import { ExperienciaU } from './entities/experiencia-u.entity';
import { UpdateExperienciaDto } from './dto/update-experiencia.dto';

@Injectable()
export class ExperienciasService {
  constructor(
    @InjectRepository(ExperienciaU)
    private readonly experienciaRepository: Repository<ExperienciaU>,
  ) {}

  // 1. REGISTRAR UN VIAJE COMPLETO (Relato + Gastos)
  async create(createExperienciaDto: CreateExperienciaDto) {
    // Gracias al "cascade: true" en tu entidad, NestJS guardará
    // la experiencia y la lista de costos al mismo tiempo en sus respectivas tablas.
    const nuevaExp = this.experienciaRepository.create({
      resumen_experiencia: createExperienciaDto.resumen_experiencia,
      fecha_viaje: createExperienciaDto.fecha_viaje,
      usuario: { id_u: createExperienciaDto.id_usuario },
      destino: { id_d: createExperienciaDto.id_destino },
      costos: createExperienciaDto.costos,
    });

    return await this.experienciaRepository.save(nuevaExp);
  }

  // 2. VER TODAS LAS EXPERIENCIAS DE UN DESTINO (Para que los viajeros lean a otros)
  async findByDestino(id_destino: number) {
    return await this.experienciaRepository.find({
      where: { destino: { id_d: id_destino } },
      relations: ['usuario', 'costos', 'comentarios', 'valoraciones'],
      order: { fecha_viaje: 'DESC' }, // Ordenamos de lo más reciente a lo más antiguo
    });
  }

  // 3. OBTENER UNA SOLA EXPERIENCIA
  async findOne(id: number) {
    return await this.experienciaRepository.findOne({
      where: { id_exp: id },
      relations: [
        'usuario',
        'destino',
        'costos',
        'comentarios',
        'comentarios.usuario',
      ],
    });
  }
  // 4. ACTUALIZAR UNA EXPERIENCIA (Usando el UpdateExperienciaDto)
  async update(id: number, updateExperienciaDto: UpdateExperienciaDto) {
    // Primero buscamos que la experiencia exista
    const experiencia = await this.findOne(id);

    if (!experiencia) {
      throw new NotFoundException(`La experiencia con ID ${id} no existe.`);
    }

    // TypeORM "mezcla" los datos antiguos con los nuevos que envíe el usuario, con la finalidad
    const experienciaActualizada = this.experienciaRepository.merge(
      experiencia,
      updateExperienciaDto,
    );
    return await this.experienciaRepository.save(experienciaActualizada);
  }

  // 5. ELIMINAR UNA EXPERIENCIA
  async remove(id: number) {
    const experiencia = await this.findOne(id);

    if (!experiencia) {
      throw new NotFoundException(`La experiencia con ID ${id} no existe.`);
    }

    return await this.experienciaRepository.remove(experiencia);
  }
}
