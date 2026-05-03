import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}
  // 1. REGISTRAR USUARIO (AHORA CON ENCRIPTACIÓN)
  async create(createUsuarioDto: CreateUsuarioDto) {
    // Generamos el "sal" y encriptamos la contraseña (10 rondas es el estándar seguro)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUsuarioDto.password,
      saltRounds,
    );

    const nuevoUsuario = this.usuarioRepository.create({
      nombre: createUsuarioDto.nombre,
      email: createUsuarioDto.email,
      password: hashedPassword, // ¡Guardamos la versión encriptada!
    });

    return await this.usuarioRepository.save(nuevoUsuario);
  }

  // 2. FUNCIÓN DE LOGIN (NUEVA)
  async login(email: string, passwordTextoPlano: string) {
    // 1. Buscamos si existe un usuario con ese email
    const usuario = await this.usuarioRepository.findOne({ where: { email } });
    if (!usuario) {
      throw new NotFoundException('Credenciales incorrectas');
    }

    // 2. Comparamos la contraseña que escribió con la encriptada de la BD
    const isPasswordValid = await bcrypt.compare(
      passwordTextoPlano,
      usuario.password,
    );
    if (!isPasswordValid) {
      throw new NotFoundException('Credenciales incorrectas'); // Mismo mensaje por seguridad
    }
    // El Payload es la información pública que irá dentro del token
    const payload = {
      sub: usuario.id_u, // 'sub' es el estándar para el ID del usuario
      email: usuario.email,
      rol: usuario.rol,
    };

    // Firmamos el token con nuestro JWT_SECRET
    const token = this.jwtService.sign(payload);

    // 3. Si todo está bien, devolvemos los datos del usuario (PERO SIN LA CONTRASEÑA)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...usuarioSinPassword } = usuario;
    return {
      mensaje: 'Login exitoso',
      usuario: usuarioSinPassword,
      token_acceso: token,
    };
  }

  // 2. LISTAR TODOS LOS USUARIOS (Usualmente solo para el Admin)
  async findAll() {
    return await this.usuarioRepository.find();
  }

  // 3. OBTENER UN USUARIO ESPECÍFICO (Para ver su perfil)
  async findOne(id: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id_u: id },
      // Traemos también sus planes y experiencias para que su perfil esté completo
      relations: ['planes', 'experiencias'],
    });

    if (!usuario) {
      throw new NotFoundException(`El usuario con ID ${id} no fue encontrado.`);
    }

    return usuario;
  }
}
