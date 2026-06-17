import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Destino } from '../../destinos/entities/destino.entity';
import { CostoDetalle } from './costo-detalle.entity';
import { Comentario } from './comentario.entity';
import { Valoracion } from './valoracion.entity';

@Entity('experiencias_u')
export class ExperienciaU {
  @PrimaryGeneratedColumn()
  id_exp!: number;

  @Column('text', { nullable: true })
  resumen_experiencia!: string;

  @Column({ type: 'date' })
  fecha_viaje!: string;

  // 💡 NUEVO CAMPO: Días de estadía reales
  @Column({ type: 'int', default: 1 })
  dias_estadia!: number;

  @Column({ nullable: true })
  url_foto?: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.experiencias)
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario;

  @ManyToOne(() => Destino, (destino) => destino.experiencias)
  @JoinColumn({ name: 'id_destino' })
  destino!: Destino;

  @OneToMany(() => CostoDetalle, (costo) => costo.experiencia, {
    cascade: true,
  })
  costos!: CostoDetalle[];

  @OneToMany(() => Comentario, (comentario) => comentario.experiencia)
  comentarios!: Comentario[];

  @OneToMany(() => Valoracion, (valoracion) => valoracion.experiencia)
  valoraciones!: Valoracion[];
}
