import { forwardRef, Module } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module';
import { ChatGateway } from './chat.gateway';
import { UsuarioModule } from 'src/user/user.module';

@Module({
    imports: [
        forwardRef(() => ChatModule),
        UsuarioModule
    ],
    providers: [
        ChatGateway,
    ],
    exports: [
        ChatGateway,
    ],
})
export class ChatGatewayModule { }
