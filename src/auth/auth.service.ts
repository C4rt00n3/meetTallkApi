import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { CreateLoginDto } from './dto/created.login';
import { PrismaService } from 'src/prisma.service';
import { OAuth2Client } from 'google-auth-library';
import { User } from '@prisma/client';
import AuthTokens from './AuthTokens.interface';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly usersService: UserService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  /**
   * Gera um par de access_token e refresh_token para um dado payload de usuário.
   * Os tempos de expiração são definidos por variáveis de ambiente.
   * @param payload Payload do JWT (geralmente { sub: uuid do usuário, email: email do usuário }).
   * @param user Objeto UserEntity associado.
   * @returns {Promise<AuthTokens>} Um objeto contendo os tokens e os dados do usuário.
   */
  async generateTokens(payload: { sub: string; email: string }, user: UserEntity): Promise<AuthTokens> {
    // access_token: Curta duração (ex: 15 minutos)
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '15m', // Tempo de expiração padrão
      issuer: 'int', // Emissor do token
    });

    // refresh_token: Longa duração (ex: 7 dias)
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d', // Tempo de expiração padrão
      issuer: 'int',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user,
    };
  }

  /**
   * Realiza a autenticação de um usuário com base no email e senha fornecidos.
   *
   * @param {CreateLoginDto} param0 - Objeto contendo o email e a senha do usuário.
   * @param {string} param0.email - O email do usuário.
   * @param {string} param0.password - A senha do usuário.
   *
   * @returns {Promise<AuthTokens>}
   * Um objeto contendo o token de acesso, o refresh token e os dados do usuário autenticado.
   *
   * @throws {NotFoundException} Se o usuário não for encontrado.
   * @throws {UnauthorizedException} Se a senha estiver incorreta ou o usuário não for autenticado.
   */
  async signIn({ email, password }: CreateLoginDto): Promise<AuthTokens> {
    const user = await this.usersService.findByEmail(email) as unknown as UserEntity;
    const { auth } = user

    if (!user || !auth) {
      throw new NotFoundException("Usuário não encontrado");
    }

    const isValidUser = bcrypt.compareSync(password, auth.password);

    if (!isValidUser) {
      throw new UnauthorizedException("Email ou senha inválidos");
    }

    const payload = { sub: user.uuid, email: auth.email };
    return this.generateTokens(payload, user); // Retorna ambos os tokens
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
      birthDate.setDate(today.getDate());
      birthDate.setMonth(today.getMonth());
      birthDate.setFullYear(today.getFullYear() - minAge);
    }
    return birthDate;
  }

  /**
   * Realiza login com a funcionalidade de login do Google.
   * @param data Dados do usuário do Google, incluindo userId, email e nome.
   * @throws {UnauthorizedException} Se o token Google for inválido ou o usuário não puder ser processado.
   * @returns {Promise<AuthTokens>}
   * Um objeto contendo o token de acesso interno, o refresh token e os dados do usuário autenticado.
   */
  async singInGoogle(data: any): Promise<AuthTokens> {
    try {
      let user = await this.usersService.find(data.userId).catch(_ => null) as unknown as UserEntity | null;

      if (!user && data.email) {
        user = await this.prisma.user.create({
          data: {
            uuid: data.userId,
            name: data.name || "Anonimo",
            birthDate: this.getBirthDateForMinAge(18),
            provider: "google",
            auth: {
              create: {
                email: data.email
              }
            },
            privacyUser: {
              create: {
                noMarkRead: false,
                imageBreak: 0,
                talkBreak: 0
              }
            },
            preference: {
              create: {
                gender: "O",
                maxAge: 100
              }
            }
          }
        }) as unknown as UserEntity; // Assegura o tipo para correspondência
      }

      if (!user) {
        throw new UnauthorizedException('Falha ao criar/encontrar usuário Google.');
      }

      // O payload deve conter informações essenciais para identificar o usuário
      // Certifique-se de que 'data.email' está disponível a partir dos dados do Google
      const payload = { sub: user.uuid, email: data.email };
      return this.generateTokens(payload, user); // Retorna ambos os tokens

    } catch (error) {
      console.error('Erro ao validar ou processar autenticação Google:', error);
      throw new UnauthorizedException('Falha na autenticação com o Google.');
    }
  }

  /**
  * Gera um novo access token e refresh token a partir de um refresh token válido.
  * Este método é chamado quando o access token expira e o cliente precisa de um novo.
  *
  * @param refreshToken O refresh token recebido do cliente.
  * @returns {Promise<AuthTokens>} Um objeto contendo os novos access_token e refresh_token,
  * e os dados do usuário autenticado.
  * @throws {UnauthorizedException} Se o refresh token for inválido, expirado ou o usuário não for encontrado.
  */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // 1. Verificar o refresh token
      // O `verifyAsync` validará a assinatura, a expiração e o emissor do token.
      const decodedToken = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET, // Use a mesma secret usada para assinar o refresh token
        issuer: 'int', // Certifique-se de que o emissor corresponde ao que foi definido
      });

      // Extrair o ID do usuário (subject) do payload decodificado
      const userId = decodedToken.sub;
      if (!userId) {
        throw new UnauthorizedException('Refresh token inválido: ID do usuário ausente no payload.');
      }

      // 2. Encontrar o usuário para garantir que ele ainda existe e está ativo no sistema
      // É importante carregar as informações de autenticação (auth) do usuário para obter o email
      const user = await this.usersService.find(userId) as unknown as UserEntity;
      // Nota: Certifique-se que o `find` do `usersService` carrega a relação `auth`
      // para que `user.auth.email` esteja disponível.
      if (!user || !user.auth || !user.auth.email) {
        throw new UnauthorizedException('Usuário associado ao refresh token não encontrado ou dados incompletos.');
      }

      // 3. Gerar novos tokens (access e refresh)
      const payload = { sub: user.uuid, email: user.auth.email };
      return this.generateTokens(payload, user); // Gera e retorna um novo par de tokens

    } catch (error: any) {
      console.error('Erro ao renovar token:', error);
      throw new BadRequestException(error.message || 'Refresh token inválido ou expirado.');
    }
  }
}
