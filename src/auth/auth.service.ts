import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { CreateLoginDto } from './dto/created.login';
import { PrismaService } from 'src/prisma.service';
import { OAuth2Client } from 'google-auth-library'; // Importe a biblioteca do Google
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client; // Declare a propriedade googleClient

  constructor(
    private readonly usersService: UserService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {
    // Inicialize o cliente Google com o ID do seu cliente (Client ID)
    // O GOOGLE_CLIENT_ID deve vir das suas credenciais OAuth 2.0 do Google Cloud
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  /**
   * Realiza a autenticação de um usuário com base no email e senha fornecidos.
   *
   * @param {CreateLoginDto} param0 - Objeto contendo o email e a senha do usuário.
   * @param {string} param0.email - O email do usuário.
   * @param {string} param0.password - A senha do usuário.
   *
   * @returns {Promise<{ access_token: string; user: UserEntity }>}
   * Um objeto contendo o token de acesso e os dados do usuário autenticado.
   *
   * @throws {NotFoundException} Se o usuário não for encontrado.
   * @throws {UnauthorizedException} Se a senha estiver incorreta ou o usuário não for autenticado.
   */
  async signIn({ email, password }: CreateLoginDto): Promise<any> {
    const {auth ,...user} = await this.usersService.findByEmail(email) as unknown as UserEntity;

    if (!user || !auth) {
      throw new NotFoundException("Usuário não encontrado");
    }

    const isValidUser = bcrypt.compareSync(password, auth.password);

    if (!isValidUser) {
      throw new UnauthorizedException("Email ou senha inválidos");
    }

    const payload = { sub: user.uuid, email: auth.email };

    

    return {
      access_token: await this.jwtService.signAsync(payload, {
        issuer: 'int', // Use a string que você definiu para seus tokens
      }),
      user,
    };
  }

  getBirthDateForMinAge(minAge: number): Date {
    const today = new Date();
    const birthDate = new Date(
      today.getFullYear() - minAge,
      today.getMonth(),
      today.getDate()
    );
    // Ajuste para garantir que é exatos 'minAge' anos atrás,
    // considerando casos como 29 de fevereiro.
    if (birthDate.getFullYear() !== today.getFullYear() - minAge) {
      // Se a data do aniversário for depois de hoje no ano 'minAge' anos atrás
      // (ex: hoje é 28/fev, mas 18 anos atrás 29/fev), ajusta para o último dia do mês
      birthDate.setDate(today.getDate());
      birthDate.setMonth(today.getMonth());
      birthDate.setFullYear(today.getFullYear() - minAge);
    }
    return birthDate;
  }

  /**
   * Realiza login com a funcionalidade de login do Google.
   * @param user.email Email do usuário.
   * @param user.token Token de autenticação do Google (ID Token).
   * @throws {UnauthorizedException} Se o token Google for inválido ou o usuário não puder ser processado.
   * @returns {Promise<{ access_token: string; user: UserEntity }>}
   * Um objeto contendo o token de acesso interno e os dados do usuário autenticado.
   */
  async singInGoogle(data: any) {
    try {
      let user = await this.usersService.find(data.userId).catch(_ => null)

      if (!user && data.email) {
        const user = await this.prisma.user.create({
          data: {
            uuid: data.userId,
            name: data.name || "Anonimo",
            birthDate: this.getBirthDateForMinAge(18),
            provider: "google",
            auth: {
              create: {
                email: data.email
              }
            }
          }
        })

        return {
          access_token: await this.jwtService.signAsync(data, {
            issuer: 'int', // Use a string que você definiu para seus tokens
          }),
          user: user
        }
      }

      return {
        access_token: data.token,
        user: user
      }
    } catch (error) {
      console.error('Erro ao validar ou processar token Google:', error);
      throw new UnauthorizedException('Falha na autenticação com o Google.');
    }
  }
}
