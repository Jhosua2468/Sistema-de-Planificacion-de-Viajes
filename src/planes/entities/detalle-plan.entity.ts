import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PlanViaje } from './plan-viaje.entity';
import { Destino } from '../../destinos/entities/destino.entity';

@Entity('detalle_plan') // Nombre de tu tabla SQL
export class DetallePlan {
  @PrimaryGeneratedColumn()
  id_dp!: number;

  @Column()
  orden_visita!: number;

  @ManyToOne(() => PlanViaje, (plan) => plan.detalles)
  @JoinColumn({ name: 'id_plan' })
  plan!: PlanViaje;

  @ManyToOne(() => Destino)
  @JoinColumn({ name: 'id_destino' })
  destino!: Destino;
}
