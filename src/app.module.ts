import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static'; // <-- 1. NUEVO IMPORT
import { join } from 'path'; // <-- 2. NUEVO IMPORT

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
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // Se mantiene en false
      }),
    }),

    // 3. MAGIA PARA LAS FOTOS: Hacemos pública la carpeta "uploads"
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Sube un nivel desde src y busca 'uploads'
      serveRoot: '/uploads/', // La URL pública será: http://localhost:3000/uploads/foto.jpg
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
