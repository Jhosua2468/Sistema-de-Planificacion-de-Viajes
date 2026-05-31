/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
// Asegúrate de que el DTO esté actualizado, pero si no, usaremos 'any' por ahora para destrabarte
import { CreatePlanDto } from './dto/create-plan.dto';
import { PlanViaje } from './entities/plan-viaje.entity';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlanesService {
  constructor(
    @InjectRepository(PlanViaje)
    private readonly planRepository: Repository<PlanViaje>,
  ) {}

  // 1. CREAR UN NUEVO PLAN
  async create(createPlanDto: CreatePlanDto) {
    const nuevoPlan = this.planRepository.create({
      nombre_viaje: createPlanDto.nombre_viaje,
      fecha_inicio: createPlanDto.fecha_inicio,
      fecha_fin: createPlanDto.fecha_fin,
      visibilidad: createPlanDto.visibilidad || 'Publico',
      estado: createPlanDto.estado || 'Borrador',
      presupuesto_total_estimado: createPlanDto.presupuesto_total_estimado || 0,
      usuario: { id_u: createPlanDto.usuario.id_u },
      // Si ya agregaste id_origen al DTO y Entidad, puedes descomentar esto:
      // origen: createPlanDto.id_origen ? { id_d: createPlanDto.id_origen } : null,
    });

    return await this.planRepository.save(nuevoPlan);
  }

  // 2. OBTENER TODOS LOS PLANES
  async findAll() {
    return await this.planRepository.find({
      relations: ['usuario', 'detalles', 'detalles.destino'],
    });
  }

  // 💡 NUEVO: OBTENER SOLO LOS PÚBLICOS (Para la comunidad)
  async findAllPublicos() {
    return await this.planRepository.find({
      where: {
        visibilidad: 'Publico',
        estado: Not('Borrador'), // 💡 REGLA DE NEGOCIO: Excluir borradores
      },
      relations: ['usuario'],
      order: { id_plan: 'DESC' },
    });
  }

  // 3. OBTENER PLAN CON FACTURA DETALLADA
  async findOne(id: number): Promise<any> {
    const plan = await this.planRepository.findOne({
      where: { id_plan: id },
      relations: ['usuario', 'detalles', 'detalles.destino'],
    });

    if (!plan) throw new NotFoundException(`El plan ID ${id} no existe`);

    const factura: any[] = []; // 💡 Aquí guardaremos el recibo detallado
    let totalMatematico = 0;

    if (plan.detalles && plan.detalles.length > 0) {
      for (const detalle of plan.detalles) {
        const idDestino = detalle.destino.id_d;
        const nombreDestino = detalle.destino.nombre;
        const dias = detalle.dias_estadia || 1;

        const experiencias: any[] = await this.planRepository.manager.query(
          `SELECT id_exp FROM experiencias_u WHERE id_destino = ?`,
          [idDestino],
        );

        let t = 0,
          h = 0,
          a = 0,
          ac = 0,
          o = 0;

        if (experiencias && experiencias.length > 0) {
          const idsExperiencias = experiencias.map((e) => e.id_exp);

          // 💡 CAMBIO 1: Añadimos COUNT(DISTINCT id_experiencia) a la consulta SQL
          const costosCategoria: any[] =
            await this.planRepository.manager.query(
              `SELECT categoria, SUM(monto) as total, COUNT(DISTINCT id_experiencia) as cantidad_experiencias 
             FROM costos_detalle 
             WHERE id_experiencia IN (?) 
             GROUP BY categoria`,
              [idsExperiencias],
            );

          costosCategoria.forEach((c) => {
            // 💡 CAMBIO 2: Dividimos solo entre la cantidad de experiencias que tienen este gasto
            const prom =
              Number(c.total || 0) / Number(c.cantidad_experiencias || 1);

            // 💡 Normalizamos strings por si en la BD hay acentos o minúsculas
            const cat = c.categoria.toLowerCase();
            if (cat.includes('transporte')) t += prom;
            else if (cat.includes('hospedaje')) h += prom;
            else if (cat.includes('alimenta')) a += prom;
            else if (cat.includes('actividad')) ac += prom;
            else o += prom; // Aquí entran los taxis locales, snacks, etc.
          });
        } else {
          // 💡 Valores base de respaldo (Por día)
          t = 40;
          h = 50;
          a = 40;
          ac = 0;
          o = 20;
        }

        // 💡 MATEMÁTICA TRANSPARENTE
        const subTransp = t; // Transporte se cobra 1 vez
        const subHosp = h * dias;
        const subAlim = a * dias;
        const subActiv = ac; // Asumimos 1 vez
        const subOtros = o * dias;

        const subtotalDestino =
          subTransp + subHosp + subAlim + subActiv + subOtros;
        totalMatematico += subtotalDestino;

        // Añadimos la fila a la factura
        factura.push({
          destino: nombreDestino,
          dias: dias,
          desglose: {
            Transporte: subTransp,
            Hospedaje: subHosp,
            Alimentacion: subAlim,
            Actividades: subActiv,
            Otros: subOtros,
          },
          costoBaseDia: { h, a, o }, // Para mostrar "Bs. X por día"
          subtotal: subtotalDestino,
        });
      }
    }

    return {
      ...plan,
      factura, // 💡 Mandamos la factura al frontend
      presupuesto_total_estimado: parseFloat(totalMatematico.toFixed(2)),
    };
  }

  // // 4. ACTUALIZAR
  // async update(id: number, updatePlanDto: UpdatePlanDto) {
  //   const plan = await this.findOne(id);
  //   const planActualizado = this.planRepository.merge(plan, updatePlanDto);
  //   return await this.planRepository.save(planActualizado);
  // }

  // 4. ACTUALIZAR (Versión Segura y Manual)
  async update(id: number, updatePlanDto: UpdatePlanDto) {
    // 1. Buscamos el plan
    const plan = await this.planRepository.findOne({ where: { id_plan: id } });

    if (!plan) {
      throw new NotFoundException(`Plan con ID ${id} no encontrado`);
    }

    // 2. Actualizamos solo los campos que existen en el DTO
    // Esto evita errores si llegan campos nulos o relaciones no deseadas
    if (updatePlanDto.nombre_viaje)
      plan.nombre_viaje = updatePlanDto.nombre_viaje;
    if (updatePlanDto.fecha_inicio)
      plan.fecha_inicio = updatePlanDto.fecha_inicio;
    if (updatePlanDto.fecha_fin) plan.fecha_fin = updatePlanDto.fecha_fin;
    if (updatePlanDto.estado) plan.estado = updatePlanDto.estado;
    if (updatePlanDto.visibilidad) plan.visibilidad = updatePlanDto.visibilidad;

    // 3. Guardamos y retornamos
    return await this.planRepository.save(plan);
  }

  // 5. ELIMINAR PLAN
  async remove(id: number) {
    const plan = await this.findOne(id);
    await this.planRepository.manager.query(
      `DELETE FROM detalle_plan WHERE id_plan = ?`,
      [id],
    );
    await this.planRepository.remove(plan);
    return { success: true, message: 'Plan eliminado correctamente' };
  }

  // 💡 LA MAGIA: Añadir destino
  async agregarDestinoConCalculo(idPlan: number, idDestino: number) {
    const plan = await this.findOne(idPlan);
    const orden = plan.detalles ? plan.detalles.length + 1 : 1;

    const experiencias: any[] = await this.planRepository.manager.query(
      `SELECT id_exp FROM experiencias_u WHERE id_destino = ?`,
      [idDestino],
    );

    let costoPromedioDestino = 250;

    if (experiencias && experiencias.length > 0) {
      const idsExperiencias = experiencias.map((e) => e.id_exp);
      const costos: any[] = await this.planRepository.manager.query(
        `SELECT SUM(monto) as total_gastado FROM costos_detalle WHERE id_experiencia IN (?) GROUP BY id_experiencia`,
        [idsExperiencias],
      );

      if (costos && costos.length > 0) {
        const sumaTotal = costos.reduce(
          (acc, curr) => acc + Number(curr.total_gastado || 0),
          0,
        );
        costoPromedioDestino = sumaTotal / costos.length;
      }
    }

    plan.presupuesto_total_estimado =
      Number(plan.presupuesto_total_estimado) + costoPromedioDestino;
    await this.planRepository.save(plan);

    await this.planRepository.manager.query(
      `INSERT INTO detalle_plan (id_plan, id_destino, orden_visita, dias_estadia) VALUES (?, ?, ?, ?)`,
      [idPlan, idDestino, orden, 1], // Inicia con 1 día por defecto
    );

    return { success: true, message: 'Destino añadido correctamente' };
  }

  // 💡 ELIMINAR DESTINO
  async removerDestinoConCalculo(idPlan: number, idDp: number) {
    const plan = await this.findOne(idPlan);
    const detalle: any[] = await this.planRepository.manager.query(
      `SELECT id_destino FROM detalle_plan WHERE id_dp = ?`,
      [idDp],
    );

    if (detalle.length > 0) {
      const idDestino = detalle[0].id_destino;
      const experiencias: any[] = await this.planRepository.manager.query(
        `SELECT id_exp FROM experiencias_u WHERE id_destino = ?`,
        [idDestino],
      );

      let costoRestar = 250;

      if (experiencias && experiencias.length > 0) {
        const idsExperiencias = experiencias.map((e) => e.id_exp);
        const costos: any[] = await this.planRepository.manager.query(
          `SELECT SUM(monto) as total_gastado FROM costos_detalle WHERE id_experiencia IN (?) GROUP BY id_experiencia`,
          [idsExperiencias],
        );

        if (costos && costos.length > 0) {
          const sumaTotal = costos.reduce(
            (acc, curr) => acc + Number(curr.total_gastado || 0),
            0,
          );
          costoRestar = sumaTotal / costos.length;
        }
      }

      plan.presupuesto_total_estimado = Math.max(
        0,
        Number(plan.presupuesto_total_estimado) - costoRestar,
      );
      await this.planRepository.save(plan);

      await this.planRepository.manager.query(
        `DELETE FROM detalle_plan WHERE id_dp = ?`,
        [idDp],
      );
    }

    return { success: true, message: 'Destino eliminado' };
  }

  // 💡 CLONAR UN PLAN PÚBLICO
  async clonarPlan(idPlanOriginal: number, idUsuarioDestino: number) {
    const planOriginal = await this.findOne(idPlanOriginal);

    const nuevoPlan = this.planRepository.create({
      nombre_viaje: `Copia de ${planOriginal.nombre_viaje}`,
      fecha_inicio: planOriginal.fecha_inicio,
      fecha_fin: planOriginal.fecha_fin,
      visibilidad: 'Privado',
      estado: 'Borrador',
      presupuesto_total_estimado: planOriginal.presupuesto_total_estimado,
      usuario: { id_u: idUsuarioDestino },
    });

    const planGuardado = await this.planRepository.save(nuevoPlan);

    if (planOriginal.detalles && planOriginal.detalles.length > 0) {
      for (const detalle of planOriginal.detalles) {
        await this.planRepository.manager.query(
          `INSERT INTO detalle_plan (id_plan, id_destino, orden_visita, dias_estadia) VALUES (?, ?, ?, ?)`,
          [
            planGuardado.id_plan,
            detalle.destino.id_d,
            detalle.orden_visita,
            detalle.dias_estadia || 1,
          ],
        );
      }
    }

    return {
      success: true,
      message: 'Clonado con éxito',
      nuevoId: planGuardado.id_plan,
    };
  }

  // 💡 NUEVO: ACTUALIZAR DÍAS DE ESTADÍA Y RECALCULAR
  async actualizarDiasEstadiaConCalculo(
    idPlan: number,
    idDp: number,
    nuevosDias: number,
  ) {
    // 1. Actualizamos los días
    await this.planRepository.manager.query(
      `UPDATE detalle_plan SET dias_estadia = ? WHERE id_dp = ?`,
      [nuevosDias, idDp],
    );

    // 2. Recalculamos trayendo el plan (que ahora multiplicará los días en findOne)
    const planRecalculado = await this.findOne(idPlan);

    // 3. Sincronizamos el nuevo total
    await this.planRepository.query(
      `UPDATE plan_viaje SET presupuesto_total_estimado = ? WHERE id_plan = ?`,
      [planRecalculado.presupuesto_total_estimado, idPlan],
    );

    return { success: true, message: 'Días actualizados con éxito' };
  }
}
