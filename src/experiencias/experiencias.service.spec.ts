import { Test, TestingModule } from '@nestjs/testing';
import { ExperienciasService } from './experiencias.service';

describe('ExperienciasService', () => {
  let service: ExperienciasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExperienciasService],
    }).compile();

    service = module.get<ExperienciasService>(ExperienciasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
