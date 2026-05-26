import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';

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

  // 2. FUNCIÓN DE LOGIN
  //en esta funcion pedimos el email y la contraseña en texto plano, luego validamos y devolvemos un token JWT si todo es correcto
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
      throw new NotFoundException('Contraseña incorrecta'); // Mismo mensaje por seguridad
    }
    // El Payload es la información pública que irá dentro del token
    const payload = {
      sub: usuario.id_u, // 'sub' es el estándar para el ID del usuario
      email: usuario.email,
      rol: usuario.rol,
    };

    // Firmamos el token con nuestro JWT_SECRET
    const token = this.jwtService.sign(payload);

    // 3. Si todo está bien, devolvemos los datos del usuario
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

  // 3. OBTENER UN USUARIO ESPECÍFICO (Para ver su perfil y sus planes)
  async findOne(id: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id_u: id },
      // 💡 NUEVO: Traemos los planes y, si tiene, los destinos de esos planes
      relations: [
        'planes',
        'planes.detalles', // Esto trae la tabla puente
        'planes.detalles.destino', // Esto trae el nombre del lugar
        'experiencias',
      ],
    });

    if (!usuario) {
      throw new NotFoundException(`El usuario con ID ${id} no fue encontrado.`);
    }

    return usuario;
  }

  // --- MÉTODOS PARA RECUPERACIÓN DE CONTRASEÑA ---

  // Buscar usuario por email exacto
  async findByEmail(email: string) {
    return await this.usuarioRepository.findOne({ where: { email } });
  }

  // Guardar el PIN temporal en la base de datos
  async guardarCodigoRecuperacion(id: number, codigo: string) {
    await this.usuarioRepository.update(id, { codigo_recuperacion: codigo });
  }

  // Validar el PIN y actualizar la contraseña
  async resetearPasswordConCodigo(
    email: string,
    codigo: string,
    nuevaPass: string,
  ) {
    const usuario = await this.usuarioRepository.findOne({ where: { email } });

    if (!usuario || usuario.codigo_recuperacion !== codigo) {
      // Importante: Asegúrate de tener importado BadRequestException arriba
      throw new BadRequestException('El código es incorrecto o ha expirado.');
    }

    // Encriptamos la nueva contraseña
    const saltRounds = 10;
    usuario.password = await bcrypt.hash(nuevaPass, saltRounds);

    // Borramos el código para que no se pueda volver a usar
    usuario.codigo_recuperacion = null;

    await this.usuarioRepository.save(usuario);
    return { message: 'Contraseña actualizada correctamente.' };
  }

  // --- NUEVA FUNCIÓN: ENVÍO DE CORREO REAL ---
  async enviarCorreoRecuperacion(email: string, pin: string) {
    // 1. Configuramos el "Cartero" de Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'sayguajosue41@gmail.com', // PONE TU CORREO AQUÍ
        pass: 'tuyg gbkg nbli xfbr', // PONE LA CONTRASEÑA DE APLICACIÓN AQUÍ (Sin espacios)
      },
    });

    // 2. Armamos el diseño del correo
    const mailOptions = {
      from: '"Planifica Viajes ✈️" <sayguajosue41@gmail.com>', // Quien lo envía
      to: email, // El correo del usuario que olvidó su clave
      subject: '🔐 Código de Recuperación de Contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2>Hola viajero,</h2>
          <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
          <p>Tu código de seguridad (PIN) es:</p>
          <h1 style="color: #0984e3; letter-spacing: 5px;">${pin}</h1>
          <p><i>Si no fuiste tú, por favor ignora este mensaje.</i></p>
        </div>
      `,
    };

    // 3. Enviamos el correo
    await transporter.sendMail(mailOptions);
  }
}
