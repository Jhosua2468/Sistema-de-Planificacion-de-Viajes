/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExperienciaDto } from './dto/create-experiencia.dto';
import { ExperienciaU } from './entities/experiencia-u.entity';
import { UpdateExperienciaDto } from './dto/update-experiencia.dto';
import { DataSource } from 'typeorm';
import { Comentario } from './entities/comentario.entity';

@Injectable()
export class ExperienciasService {
  constructor(
    @InjectRepository(ExperienciaU)
    private readonly experienciaRepository: Repository<ExperienciaU>,
    @InjectRepository(Comentario)
    private readonly comentarioRepository: Repository<Comentario>,
    private readonly dataSource: DataSource,
  ) {}

  // 1. REGISTRAR UN VIAJE COMPLETO (Transacción Maestra)
  async create(createDto: CreateExperienciaDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // A. Crear la Experiencia Principal
      const resultExp = await queryRunner.query(
        `INSERT INTO experiencias_u (resumen_experiencia, fecha_viaje, id_usuario, id_destino, dias_estadia) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          createDto.resumen_experiencia,
          createDto.fecha_viaje || new Date().toISOString().split('T')[0],
          createDto.id_usuario,
          createDto.id_destino,
          createDto.dias_estadia || 1, // 💡 Guardamos los días, por defecto 1
        ],
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const newExpId = resultExp.insertId;

      // B. Insertar la Valoración (Estrellas)
      await queryRunner.query(
        `INSERT INTO valoraciones (puntuacion, id_experiencia, id_usuario) 
         VALUES (?, ?, ?)`,
        [createDto.puntuacion, newExpId, createDto.id_usuario],
      );

      // C. Insertar los Costos (Solo los que son mayores a 0)
      if (createDto.costos && createDto.costos.length > 0) {
        for (const costo of createDto.costos) {
          if (costo.monto > 0) {
            await queryRunner.query(
              `INSERT INTO costos_detalle (categoria, descripcion_gasto, monto, id_experiencia) 
               VALUES (?, ?, ?, ?)`,
              [costo.categoria, costo.descripcion_gasto, costo.monto, newExpId],
            );
          }
        }
      }

      // Si todo sale bien, confirmamos la transacción
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Experiencia guardada con éxito',
        id_exp: newExpId,
      };
    } catch (error) {
      // Si algo explota (ej: se cae la red), revertimos todo para no dejar datos huérfanos
      await queryRunner.rollbackTransaction();
      console.error('Error en la transacción de experiencia:', error);
      throw error;
    } finally {
      // Siempre liberamos la conexión
      await queryRunner.release();
    }
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
  // 4. ACTUALIZAR UNA EXPERIENCIA (Transacción Compleja)
  async update(id: number, updateDto: UpdateExperienciaDto) {
    // Verificamos que exista primero
    const experiencia = await this.findOne(id);
    if (!experiencia) {
      throw new NotFoundException(`La experiencia con ID ${id} no existe.`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // A. Actualizar la tabla principal (Resumen y/o Días)
      const updates: string[] = []; // 💡 Le decimos que será un arreglo de textos
      const values: any[] = []; // 💡 Le decimos que puede ser cualquier cosa (texto o número)

      if (updateDto.resumen_experiencia) {
        updates.push('resumen_experiencia = ?');
        values.push(updateDto.resumen_experiencia);
      }

      if (updateDto.dias_estadia) {
        updates.push('dias_estadia = ?');
        values.push(updateDto.dias_estadia);
      }

      if (updates.length > 0) {
        values.push(id); // Añadimos el ID al final para el WHERE
        await queryRunner.query(
          `UPDATE experiencias_u SET ${updates.join(', ')} WHERE id_exp = ?`,
          values,
        );
      }

      // B. Actualizar las Estrellas (Valoraciones)
      if (updateDto.puntuacion) {
        await queryRunner.query(
          `UPDATE valoraciones SET puntuacion = ? WHERE id_experiencia = ?`,
          [updateDto.puntuacion, id],
        );
      }

      // C. Actualizar Costos (La estrategia más segura es borrar los viejos e insertar los nuevos)
      if (updateDto.costos) {
        // 1. Borramos los costos anteriores de esta experiencia
        await queryRunner.query(
          `DELETE FROM costos_detalle WHERE id_experiencia = ?`,
          [id],
        );

        // 2. Insertamos los nuevos
        for (const costo of updateDto.costos) {
          if (costo.monto > 0) {
            await queryRunner.query(
              `INSERT INTO costos_detalle (categoria, descripcion_gasto, monto, id_experiencia) 
               VALUES (?, ?, ?, ?)`,
              [costo.categoria, costo.descripcion_gasto, costo.monto, id],
            );
          }
        }
      }

      await queryRunner.commitTransaction();
      return { success: true, message: 'Experiencia actualizada con éxito' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error al actualizar experiencia:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 5. ELIMINAR UNA EXPERIENCIA
  async remove(id: number) {
    const experiencia = await this.findOne(id);
    if (!experiencia) {
      throw new NotFoundException(`La experiencia con ID ${id} no existe.`);
    }
    // Gracias al borrado en cascada (cascade) en tu BD, al borrar la experiencia,
    // se borrarán sus costos y valoraciones automáticamente.
    return await this.experienciaRepository.remove(experiencia);
  }

  // 💡 NUEVO: OBTENER EXPERIENCIAS POR USUARIO
  async findByUsuario(idUsuario: number) {
    return await this.experienciaRepository.find({
      where: { usuario: { id_u: idUsuario } },
      relations: ['destino', 'costos', 'valoraciones'],
      order: { fecha_viaje: 'DESC' },
    });
  }

  // 💡 PARA EL PANEL DE ADMINISTRADOR: Obtener todas las experiencias cruzadas
  async findAllAdmin() {
    return await this.experienciaRepository.find({
      relations: [
        'usuario',
        'destino',
        'costos',
        'valoraciones',
        'comentarios',
        'comentarios.usuario',
      ],
      order: { fecha_viaje: 'DESC' },
    });
  }

  // ==========================================
  // 🌟 SECCIÓN: COMENTARIOS Y LIKES
  // ==========================================

  // 1. Crear un comentario (o responder a uno si viene id_respuesta_a)
  async crearComentario(
    idExperiencia: number,
    idUsuario: number,
    mensaje: string,
    idRespuestaA?: number,
  ) {
    const nuevoComentario = this.comentarioRepository.create({
      mensaje: mensaje,
      experiencia: { id_exp: idExperiencia },
      usuario: { id_u: idUsuario },
      comentarioPadre: idRespuestaA ? { id_c: idRespuestaA } : undefined, // 💡 Si es respuesta, lo enlazamos
    });
    return await this.comentarioRepository.save(nuevoComentario);
  }

  // 2. Dar Like a un comentario
  async darLikeComentario(idComentario: number) {
    const comentario = await this.comentarioRepository.findOne({
      where: { id_c: idComentario },
    });
    if (!comentario) {
      throw new NotFoundException(
        `El comentario con ID ${idComentario} no existe.`,
      );
    }
    // Incrementamos el contador
    comentario.likes += 1;
    return await this.comentarioRepository.save(comentario);
  }

  // 3. Eliminar comentario
  async eliminarComentario(idComentario: number) {
    const comentario = await this.comentarioRepository.findOne({
      where: { id_c: idComentario },
    });
    if (!comentario) {
      throw new NotFoundException(
        `El comentario con ID ${idComentario} no existe.`,
      );
    }
    // Gracias a onDelete: 'CASCADE' en la entidad, borrar el padre borra las respuestas
    return await this.comentarioRepository.remove(comentario);
  }
}
