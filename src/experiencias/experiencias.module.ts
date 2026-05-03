// En src/experiencias/experiencias.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExperienciasService } from './experiencias.service';
import { ExperienciasController } from './experiencias.controller';
import { ExperienciaU } from './entities/experiencia-u.entity';
import { CostoDetalle } from './entities/costo-detalle.entity';
import { Comentario } from './entities/comentario.entity';
import { Valoracion } from './entities/valoracion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExperienciaU,
      CostoDetalle,
      Comentario,
      Valoracion,
    ]),
  ],
  controllers: [ExperienciasController],
  providers: [ExperienciasService],
})
export class ExperienciasModule {}
