import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { OAuth2Client } from 'google-auth-library';
import * as jwt from 'jsonwebtoken'; // Importe a biblioteca jsonwebtoken diretamente

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly googleClient: OAuth2Client;

  constructor(private readonly jwtService: JwtService) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token não fornecido.');
    }

    try {
      let payload: any;
      const decodedToken: any = jwt.decode(token);

      if (!decodedToken) {
        throw new UnauthorizedException('Token malformado ou inválido.');
      }

      if (decodedToken.iss === 'int') {
        try {
          payload = await this.jwtService.verifyAsync(token, {
            secret: process.env.SECRET_KEY,
            issuer: 'int', 
          });
        } catch (internalError) {
          console.error('Falha na verificação do token interno:', internalError.message);
          throw new UnauthorizedException('Token interno inválido ou expirado.');
        }
      } else if(decodedToken.iss === "https://accounts.google.com") {
        try {
          payload = await this.verifyGoogleToken(token);
          payload.token = token
        } catch (googleError) {
          console.error('Falha na verificação do token Google:', googleError.message);
          throw new UnauthorizedException('Token Google inválido.');
        }
      }

      request['user'] = payload;
      return true;
    } catch (error) {
      console.error('Erro geral de autenticação:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token inválido ou ocorreu um erro inesperado.');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async verifyGoogleToken(token: string): Promise<any> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Payload do token Google vazio.');
      }

      return {
        userId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        source: 'google', // Indica a origem do token
      };
    } catch (error) {
      console.error('Erro na verificação do token Google:', error);
      throw new UnauthorizedException('Token Google inválido.');
    }
  }
}