import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('meses')
export class Mes {
  @PrimaryGeneratedColumn()
  id_mes!: number;

  @Column({ length: 20 })
  nombre!: string;
}
