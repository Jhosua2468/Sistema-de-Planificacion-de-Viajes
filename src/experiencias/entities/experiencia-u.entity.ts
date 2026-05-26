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

  //foto opcional de la experiencia, el usuario puede subir una foto representativa de su viaje, pero no es obligatorio. Si no se proporciona una URL, el valor será null en la base de datos, lo cual es perfectamente válido.
  @Column({ nullable: true }) // Opcional
  url_foto?: string;

  // En el SQL se llama id_usuario y id_destino. JoinColumn asegura que TypeORM use esos nombres.
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
