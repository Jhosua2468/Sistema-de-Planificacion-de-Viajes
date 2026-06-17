import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
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

  // 💡 NUEVO: Contador de likes
  @Column({ type: 'int', default: 0 })
  likes!: number;

  @ManyToOne(() => ExperienciaU, (exp) => exp.comentarios)
  @JoinColumn({ name: 'id_experiencia' })
  experiencia!: ExperienciaU;

  @ManyToOne(() => Usuario, (usuario) => usuario.comentarios)
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario;

  // 💡 NUEVO: Relación de "Padre a Hijo" para las respuestas a comentarios
  @ManyToOne(() => Comentario, (comentario) => comentario.respuestas, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_respuesta_a' })
  comentarioPadre!: Comentario;

  @OneToMany(() => Comentario, (comentario) => comentario.comentarioPadre)
  respuestas!: Comentario[];
}
