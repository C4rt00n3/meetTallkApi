import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CraeteLogin } from './dto/created.login';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from 'src/usuario/usuario.service';
import { UsuarioEntity } from 'src/usuario/entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsuarioService,
    private jwtService: JwtService
  ) { }

  /**
 * Realiza a autenticação de um usuário com base no email e senha fornecidos.
 *
 * @param {CraeteLogin} param0 - Objeto contendo o email e a senha do usuário.
 * @param {string} param0.email - O email do usuário.
 * @param {string} param0.password - A senha do usuário.
 *
 * @returns {Promise<{ access_token: string; user: UsuarioEntity }>} 
 * Um objeto contendo o token de acesso e os dados do usuário autenticado.
 *
 * @throws {NotFoundException} Se o usuário não for encontrado.
 * @throws {UnauthorizedException} Se a senha estiver incorreta ou o usuário não for autenticado.
 */
  async signIn({ email, password }: CraeteLogin): Promise<{ access_token: string; user: UsuarioEntity }> {
    const user = await this.usersService.findByEmail(email);
    const autenticacao = user?.autenticacao;

    if (!user || !autenticacao) {
      throw new NotFoundException("Usuário não encontrado");
    }

    const isValidUser = bcrypt.compareSync(password, autenticacao.password);

    if (!isValidUser) {
      throw new UnauthorizedException("Email ou senha inválidos");
    }

    const payload = { sub: user.uuid, email: autenticacao.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user,
    };

  }
}