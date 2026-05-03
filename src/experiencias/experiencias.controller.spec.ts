import { Test, TestingModule } from '@nestjs/testing';
import { ExperienciasController } from './experiencias.controller';
import { ExperienciasService } from './experiencias.service';

describe('ExperienciasController', () => {
  let controller: ExperienciasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExperienciasController],
      providers: [ExperienciasService],
    }).compile();

    controller = module.get<ExperienciasController>(ExperienciasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
