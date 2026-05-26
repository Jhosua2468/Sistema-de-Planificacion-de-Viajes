import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { DetallePlan } from './detalle-plan.entity';
import { Destino } from '../../destinos/entities/destino.entity';

@Entity('plan_viaje')
export class PlanViaje {
  @PrimaryGeneratedColumn()
  id_plan!: number;

  @Column({ length: 150 })
  nombre_viaje!: string;

  @Column({ type: 'date', nullable: true })
  fecha_inicio!: string;

  @Column({ type: 'date', nullable: true })
  fecha_fin!: string;

  @Column({
    type: 'enum',
    enum: ['Borrador', 'Planificado', 'Realizado'],
    default: 'Borrador',
  })
  estado!: string;

  @Column({
    type: 'enum',
    enum: ['Publico', 'Privado'],
    default: 'Privado',
  })
  visibilidad!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  presupuesto_total_estimado!: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario;

  // 💡 NUEVO: Mapeo de la Ciudad de Origen del viaje
  @ManyToOne(() => Destino)
  @JoinColumn({ name: 'id_origen' })
  origen!: Destino;

  @OneToMany(() => DetallePlan, (detalle) => detalle.plan, { cascade: true })
  detalles!: DetallePlan[];

  // 💡 NUEVO: Control de auditoría temporal automático
  @CreateDateColumn({ type: 'timestamp' })
  fecha_creacion!: Date;
}
