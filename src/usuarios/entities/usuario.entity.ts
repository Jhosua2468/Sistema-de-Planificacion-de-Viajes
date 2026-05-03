import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PlanViaje } from '../../planes/entities/plan-viaje.entity';
import { ExperienciaU } from '../../experiencias/entities/experiencia-u.entity';
import { Comentario } from '../../experiencias/entities/comentario.entity';
import { Valoracion } from '../../experiencias/entities/valoracion.entity';

@Entity('user') // Nombre exacto de tu tabla SQL
export class Usuario {
  @PrimaryGeneratedColumn()
  id_u!: number;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ length: 100, unique: true })
  email!: string;

  @Column({ length: 255 })
  password!: string;

  @Column({ type: 'enum', enum: ['admin', 'usuario'], default: 'usuario' })
  rol!: string;

  @Column({ nullable: true }) // Opcional, puede ser null
  url_foto?: string;

  // Relaciones
  @OneToMany(() => PlanViaje, (plan) => plan.usuario)
  planes!: PlanViaje[];

  @OneToMany(() => ExperienciaU, (exp) => exp.usuario)
  experiencias!: ExperienciaU[];

  @OneToMany(() => Comentario, (com) => com.usuario)
  comentarios!: Comentario[];

  @OneToMany(() => Valoracion, (val) => val.usuario)
  valoraciones!: Valoracion[];
}
