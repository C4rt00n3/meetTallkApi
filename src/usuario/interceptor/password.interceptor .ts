import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  import * as bcrypt from 'bcrypt';
  
  @Injectable()
  export class HashPasswordInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest();
      const { autenticacao: {password} } = request.body;
  
      if (password) {
        request.body.autenticacao.password = bcrypt.hashSync(password, 10);
      }
  
      return next.handle().pipe(
        map(data => {
          return data;
        }),
      );
    }
  }
  