import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PlanesService } from './planes.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Controller('planes')
export class PlanesController {
  constructor(private readonly planesService: PlanesService) {}

  @Post()
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.planesService.create(createPlanDto);
  }

  @Get('publicos')
  getPublicos() {
    return this.planesService.findAllPublicos();
  }

  @Get()
  findAll() {
    return this.planesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.planesService.update(+id, updatePlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planesService.remove(+id);
  }

  // 💡 NUEVO ENDPOINT: POST /planes/5/destinos
  @Post(':idPlan/destinos')
  agregarDestino(
    @Param('idPlan') idPlan: string,
    @Body('id_destino') idDestino: number,
  ) {
    return this.planesService.agregarDestinoConCalculo(+idPlan, idDestino);
  }

  // 💡 NUEVO ENDPOINT: Eliminar un destino del plan
  @Delete(':idPlan/destinos/:idDp')
  removerDestino(@Param('idPlan') idPlan: string, @Param('idDp') idDp: string) {
    return this.planesService.removerDestinoConCalculo(+idPlan, +idDp);
  }

  // 💡 ENDPOINT PARA CLONAR: POST /planes/5/clonar
  @Post(':idPlan/clonar')
  clonarPlan(
    @Param('idPlan') idPlan: string,
    @Body('id_usuario') idUsuario: number,
  ) {
    return this.planesService.clonarPlan(+idPlan, idUsuario);
  }

  // 💡 NUEVO ENDPOINT: PATCH /planes/:idPlan/destinos/:idDp
  // Permite actualizar los días de estadía de una ciudad en el itinerario
  @Patch(':idPlan/destinos/:idDp')
  async actualizarDiasDestino(
    @Param('idPlan') idPlan: string,
    @Param('idDp') idDp: string,
    @Body('dias_estadia') diasEstadia: number,
  ): Promise<{ success: boolean; message: string }> {
    // 🛡️ Tipado estricto para ESLint
    return await this.planesService.actualizarDiasEstadiaConCalculo(
      +idPlan,
      +idDp,
      diasEstadia,
    );
  }
}
