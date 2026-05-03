import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Destino } from './destino.entity';
import { EstadoAprobacion } from '../../comun/enums/estado.enum'; // <-- IMPORTAR
import { Imagen } from '../../comun/entities/imagen.entity'; // <-- IMPORTAR

@Entity('atractivos')
export class Atractivo {
  @PrimaryGeneratedColumn()
  id_at!: number;

  @Column({ length: 150 })
  nombre!: string;

  @Column('text', { nullable: true })
  descripcion!: string;

  // ESTADO DE APROBACIÓN PARA COLABORADORES
  @Column({
    type: 'enum',
    enum: EstadoAprobacion,
    default: EstadoAprobacion.PENDIENTE,
  })
  estado!: EstadoAprobacion;

  @ManyToOne(() => Destino, (destino) => destino.atractivos)
  @JoinColumn({ name: 'id_destino' })
  destino!: Destino;

  // NUEVA RELACIÓN PARA MÚLTIPLES IMÁGENES
  @OneToMany(() => Imagen, (imagen) => imagen.atractivo)
  imagenes!: Imagen[];
}
