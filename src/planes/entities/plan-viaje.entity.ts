import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { DetallePlan } from './detalle-plan.entity';

@Entity('plan_viaje') // Nombre de tu tabla SQL
export class PlanViaje {
  @PrimaryGeneratedColumn()
  id_plan!: number;

  @Column({ length: 150, nullable: true })
  nombre_viaje!: string;

  // TU NUEVA COLUMNA DE ESTADO
  @Column({
    type: 'enum',
    enum: ['Borrador', 'Planificado', 'Realizado'],
    default: 'Borrador',
  })
  estado!: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  presupuesto_total_estimado!: number;

  // Relación con el creador del plan
  @ManyToOne(() => Usuario, (usuario) => usuario.planes)
  @JoinColumn({ name: 'id_usuario' }) // Nombre exacto de tu llave foránea en SQL
  usuario!: Usuario;

  // Relación con los destinos que forman el itinerario
  @OneToMany(() => DetallePlan, (detalle) => detalle.plan, { cascade: true })
  detalles!: DetallePlan[];
}
