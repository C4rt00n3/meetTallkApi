import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { CreateLoginDto } from './dto/created.login';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private jwtService: JwtService
  ) { }

  /**
 * Realiza a autenticação de um usuário com base no email e senha fornecidos.
 *
 * @param {CraeteLogin} param0 - Objeto contendo o email e a senha do usuário.
 * @param {string} param0.email - O email do usuário.
 * @param {string} param0.password - A senha do usuário.
 *
 * @returns {Promise<{ access_token: string; user: UserEntity }>} 
 * Um objeto contendo o token de acesso e os dados do usuário autenticado.
 *
 * @throws {NotFoundException} Se o usuário não for encontrado.
 * @throws {UnauthorizedException} Se a senha estiver incorreta ou o usuário não for autenticado.
 */
  async signIn({ email, password }: CreateLoginDto): Promise<{ access_token: string; user: UserEntity }> {
    const user = await this.usersService.findByEmail(email);
    const autenticacao = user?.auth;

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