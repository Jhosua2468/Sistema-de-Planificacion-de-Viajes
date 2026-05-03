import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DestinosModule } from './destinos/destinos.module';
import { ExperienciasModule } from './experiencias/experiencias.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PlanesModule } from './planes/planes.module';

@Module({
  imports: [
    // 1. Cargamos el módulo para leer el archivo .env
    ConfigModule.forRoot({
      isGlobal: true, // Permite usar las variables en todo el proyecto
      envFilePath: '.env',
    }),

    // 2. Conectamos la base de datos leyendo las variables de entorno
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'), // <-- Fallback de seguridad
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'), // <-- Fallback de seguridad
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // Se mantiene en false
      }),
    }),

    DestinosModule,
    ExperienciasModule,
    UsuariosModule,
    PlanesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
