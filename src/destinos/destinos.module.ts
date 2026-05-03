import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DestinosService } from './destinos.service';
import { DestinosController } from './destinos.controller';
import { Destino } from './entities/destino.entity';
import { Departamento } from './entities/departamento.entity';
import { Atractivo } from './entities/atractivo.entity';
import { Mes } from './entities/mes.entity';
import { Imagen } from '../comun/images/imagen.entity'; // <-- 1. IMPORTACIÓN AÑADIDA

@Module({
  // 2. Imagen AÑADIDA AL ARREGLO forFeature
  imports: [
    TypeOrmModule.forFeature([Destino, Departamento, Atractivo, Mes, Imagen]),
  ],
  controllers: [DestinosController],
  providers: [DestinosService],
})
export class DestinosModule {}
