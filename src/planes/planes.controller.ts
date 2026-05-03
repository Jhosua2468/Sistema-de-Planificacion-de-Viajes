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

@Controller('planes') // Rutas empiezan con /planes
export class PlanesController {
  constructor(private readonly planesService: PlanesService) {}

  @Post() // POST /planes
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.planesService.create(createPlanDto);
  }

  @Get() // GET /planes
  findAll() {
    return this.planesService.findAll();
  }

  @Get(':id') // GET /planes/1
  findOne(@Param('id') id: string) {
    return this.planesService.findOne(+id);
  }

  @Patch(':id') // PATCH /planes/1 (Para actualizar el "estado")
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.planesService.update(+id, updatePlanDto);
  }

  @Delete(':id') // DELETE /planes/1
  remove(@Param('id') id: string) {
    return this.planesService.remove(+id);
  }
}
