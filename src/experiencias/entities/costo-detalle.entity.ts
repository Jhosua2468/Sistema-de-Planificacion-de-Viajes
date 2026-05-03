import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ExperienciaU } from './experiencia-u.entity';

@Entity('costos_detalle')
export class CostoDetalle {
  @PrimaryGeneratedColumn()
  id_costo!: number;

  @Column({
    type: 'enum',
    enum: ['Transporte', 'Hospedaje', 'Alimentación', 'Actividades', 'Otros'],
  })
  categoria!: string;

  @Column({ length: 200, nullable: true })
  descripcion_gasto!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  monto!: number;

  @ManyToOne(() => ExperienciaU, (exp) => exp.costos)
  @JoinColumn({ name: 'id_experiencia' })
  experiencia!: ExperienciaU;
}
