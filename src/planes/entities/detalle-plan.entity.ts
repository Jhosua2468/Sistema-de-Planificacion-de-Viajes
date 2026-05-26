import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PlanViaje } from './plan-viaje.entity';
import { Destino } from '../../destinos/entities/destino.entity';

@Entity('detalle_plan')
export class DetallePlan {
  @PrimaryGeneratedColumn()
  id_dp!: number;

  @Column({ type: 'int', default: 1 })
  orden_visita!: number;

  // 💡 NUEVO: Días que el usuario planea quedarse en esta ciudad
  @Column({ type: 'int', default: 1 })
  dias_estadia!: number;

  @ManyToOne(() => PlanViaje, (plan) => plan.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_plan' })
  plan!: PlanViaje;

  @ManyToOne(() => Destino)
  @JoinColumn({ name: 'id_destino' })
  destino!: Destino;
}
