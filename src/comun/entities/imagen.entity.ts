import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Destino } from '../../destinos/entities/destino.entity';
import { Atractivo } from '../../destinos/entities/atractivo.entity';

@Entity('imagenes')
export class Imagen {
  @PrimaryGeneratedColumn()
  id_img!: number;

  @Column()
  url!: string; // Ejemplo: /uploads/abc.jpg

  // Relación opcional con Destino
  @ManyToOne(() => Destino, (destino) => destino.imagenes, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_destino' })
  destino?: Destino;

  // Relación opcional con Atractivo
  @ManyToOne(() => Atractivo, (atractivo) => atractivo.imagenes, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_atractivo' })
  atractivo?: Atractivo;
}
