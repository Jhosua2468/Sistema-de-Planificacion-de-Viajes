import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Destino } from './destino.entity';

@Entity('departamentos')
export class Departamento {
  @PrimaryGeneratedColumn()
  id_dep!: number;

  @Column({ length: 50 })
  nombre!: string;

  @OneToMany(() => Destino, (destino) => destino.departamento)
  destinos!: Destino[];
}
