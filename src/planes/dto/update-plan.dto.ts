import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanDto } from './create-plan.dto';

export class UpdatePlanDto extends PartialType(CreatePlanDto) {
  estado?: string; // Para cambiar entre 'Borrador', 'Planificado', 'Realizado'
}
