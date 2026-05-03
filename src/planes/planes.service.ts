import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlanDto } from './dto/create-plan.dto';
import { PlanViaje } from './entities/plan-viaje.entity';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlanesService {
  constructor(
    @InjectRepository(PlanViaje)
    private readonly planRepository: Repository<PlanViaje>,
  ) {}

  // 1. CREAR UN NUEVO PLAN DE VIAJE
  async create(createPlanDto: CreatePlanDto) {
    const nuevoPlan = this.planRepository.create({
      nombre_viaje: createPlanDto.nombre_viaje,
      presupuesto_total_estimado: createPlanDto.presupuesto_total_estimado || 0,
      usuario: { id_u: createPlanDto.id_usuario }, // Relacionamos con el ID del usuario
    });

    return await this.planRepository.save(nuevoPlan);
  }

  // 2. OBTENER TODOS LOS PLANES (CON SU USUARIO Y DETALLES)
  async findAll() {
    return await this.planRepository.find({
      relations: ['usuario', 'detalles', 'detalles.destino'], // Trae los datos vinculados
    });
  }

  // 3. OBTENER UN PLAN ESPECÍFICO
  async findOne(id: number) {
    const plan = await this.planRepository.findOne({
      where: { id_plan: id },
      relations: ['usuario', 'detalles', 'detalles.destino'],
    });

    if (!plan) {
      throw new NotFoundException(`El plan de viaje con ID ${id} no existe`);
    }
    return plan;
  }

  // 4. ACTUALIZAR UN PLAN (Especialmente útil para cambiar el "estado")
  async update(id: number, updatePlanDto: UpdatePlanDto) {
    const plan = await this.findOne(id); // Verificamos que exista

    // TypeORM mezcla los datos nuevos con los viejos y guarda
    const planActualizado = this.planRepository.merge(plan, updatePlanDto);
    return await this.planRepository.save(planActualizado);
  }

  // 5. ELIMINAR UN PLAN
  async remove(id: number) {
    const plan = await this.findOne(id);
    return await this.planRepository.remove(plan);
  }
}
