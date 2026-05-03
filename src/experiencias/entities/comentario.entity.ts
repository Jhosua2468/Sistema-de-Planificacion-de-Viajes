import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ExperienciaU } from './experiencia-u.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('comentarios')
export class Comentario {
  @PrimaryGeneratedColumn()
  id_c!: number;

  @Column('text')
  mensaje!: string;

  @CreateDateColumn()
  fecha_comentario!: Date;

  @ManyToOne(() => ExperienciaU, (exp) => exp.comentarios)
  @JoinColumn({ name: 'id_experiencia' })
  experiencia!: ExperienciaU;

  @ManyToOne(() => Usuario, (usuario) => usuario.comentarios)
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario;
}
