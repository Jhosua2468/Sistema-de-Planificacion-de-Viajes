import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesPermitidos = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!rolesPermitidos) {
      return true; // Si la ruta no tiene etiqueta de roles, pasa cualquiera con token
    }

    // Le decimos a TypeScript exactamente qué forma tiene nuestro request
    const request = context
      .switchToHttp()
      .getRequest<{ user: { userId: number; email: string; rol: string } }>();
    const usuario = request.user;

    // Verificamos que el usuario exista y tenga el rol correcto
    if (!usuario || !rolesPermitidos.includes(usuario.rol)) {
      throw new ForbiddenException(
        'No tienes permisos de Administrador para hacer esto.',
      );
    }

    return true;
  }
}
