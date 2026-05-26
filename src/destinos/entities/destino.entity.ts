import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { Departamento } from './departamento.entity';
import { Atractivo } from './atractivo.entity';
import { Mes } from './mes.entity';
import { EstadoAprobacion } from '../../comun/enums/estado.enum'; // <-- IMPORTAR
import { Imagen } from '../../comun/entities/imagen.entity'; // <-- IMPORTAR
import { ExperienciaU } from '../../experiencias/entities/experiencia-u.entity';

@Entity('destinos')
export class Destino {
  @PrimaryGeneratedColumn()
  id_d!: number;

  @Column({ length: 100 })
  nombre!: string;

  @Column('text', { nullable: true })
  descripcion_general!: string;

  @Column({
    type: 'enum',
    enum: EstadoAprobacion,
    default: EstadoAprobacion.PENDIENTE, // Por defecto entra como pendiente
  })
  estado!: EstadoAprobacion;

  @ManyToOne(() => Departamento, (dep) => dep.destinos)
  @JoinColumn({ name: 'id_dep' })
  departamento!: Departamento;

  @OneToMany(() => Atractivo, (atractivo) => atractivo.destino)
  atractivos!: Atractivo[];

  // Relación con la tabla intermedia destino_mes_ideal
  @ManyToMany(() => Mes)
  @JoinTable({
    name: 'destino_mes_ideal',
    joinColumn: { name: 'id_d', referencedColumnName: 'id_d' },
    inverseJoinColumn: { name: 'id_mes', referencedColumnName: 'id_mes' },
  })
  mesesIdeales!: Mes[];

  @OneToMany(() => Imagen, (imagen) => imagen.destino)
  imagenes!: Imagen[];

  @OneToMany(() => ExperienciaU, (experiencia) => experiencia.destino)
  experiencias!: ExperienciaU[];
}
