import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// 1. Creamos un molde para que TypeScript sepa exactamente qué trae el token
interface JwtPayload {
  sub: number;
  email: string;
  rol: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // 2. Usamos el operador || para garantizar que siempre haya un string, evitando el undefined
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'MiSuperSecretoUSFX2026_Viajes',
    });
  }

  // 3. Quitamos la palabra "async" porque esta función es inmediata
  validate(payload: JwtPayload) {
    // Lo que devolvemos aquí se inyecta mágicamente en el objeto request de las rutas protegidas
    return { userId: payload.sub, email: payload.email, rol: payload.rol };
  }
}
