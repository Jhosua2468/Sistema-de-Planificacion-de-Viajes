import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ExperienciaU } from './experiencia-u.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('valoraciones')
export class Valoracion {
  @PrimaryGeneratedColumn()
  id_v!: number;

  @Column()
  puntuacion!: number;

  @ManyToOne(() => ExperienciaU, (exp) => exp.valoraciones)
  @JoinColumn({ name: 'id_experiencia' })
  experiencia!: ExperienciaU;

  @ManyToOne(() => Usuario, (usuario) => usuario.valoraciones)
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario;
}
