import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanesService } from './planes.service';
import { PlanesController } from './planes.controller';
// IMPORTA LAS ENTIDADES
import { PlanViaje } from './entities/plan-viaje.entity';
import { DetallePlan } from './entities/detalle-plan.entity';

@Module({
  // REGISTRA LAS ENTIDADES AQUÍ
  imports: [TypeOrmModule.forFeature([PlanViaje, DetallePlan])],
  controllers: [PlanesController],
  providers: [PlanesService],
})
export class PlanesModule {}
