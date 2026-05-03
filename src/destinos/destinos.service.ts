import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDestinoDto } from './dto/create-destino.dto';
import { Destino } from './entities/destino.entity';
import { EstadoAprobacion } from '../comun/enums/estado.enum';
import { Imagen } from '../comun/images/imagen.entity'; // <-- RUTA CORREGIDA

@Injectable()
export class DestinosService {
  constructor(
    @InjectRepository(Destino)
    private readonly destinoRepository: Repository<Destino>,

    @InjectRepository(Imagen)
    private readonly imagenRepository: Repository<Imagen>,
  ) {}

  // 1. CREAR DESTINO (Entra como pendiente)
  async create(createDestinoDto: CreateDestinoDto) {
    const { imagenes_urls, id_dep, ...destinoData } = createDestinoDto;

    const nuevoDestino = this.destinoRepository.create({
      ...destinoData,
      departamento: { id_dep: id_dep },
    });

    const destinoGuardado = await this.destinoRepository.save(nuevoDestino);

    // Guardar las imágenes si existen
    if (imagenes_urls && imagenes_urls.length > 0) {
      const imagenesParaGuardar = imagenes_urls.map((url) => {
        return this.imagenRepository.create({
          url: url,
          destino: destinoGuardado,
        });
      });
      await this.imagenRepository.save(imagenesParaGuardar);
    }

    return destinoGuardado;
  }

  // 2. LISTAR TODOS LOS DESTINOS (Para el catálogo del frontend)
  async findAll() {
    return await this.destinoRepository.find({
      // ¡SOLO MOSTRAMOS LOS APROBADOS!
      where: { estado: EstadoAprobacion.APROBADO },
      // ¡AÑADIMOS LAS IMÁGENES A LA RESPUESTA!
      relations: ['departamento', 'atractivos', 'mesesIdeales', 'imagenes'],
    });
  }

  // 3. CALCULAR PRESUPUESTO PROMEDIO
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

  // 4. FUNCIÓN PARA EL ADMIN: Aprobar un destino propuesto
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
}
