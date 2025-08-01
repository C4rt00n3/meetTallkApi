import { Logger, Injectable, NotFoundException } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { ChatEntity } from 'src/chat/entities/chat.entity';
import { Chat, ImageProfile, Message, User } from '@prisma/client';
import { UserEntity } from 'src/user/entities/user.entity';
import * as jwt from 'jsonwebtoken'; // Importe a biblioteca jsonwebtoken diretamente


@Injectable()
@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger: Logger = new Logger('ChatGateway');
  userConnections = new Map<string, Set<string>>(); // userId => Set<socketId>

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) { }

  afterInit(server: Server) {
    this.logger.log('Init server');
  }

  async findOneChat(uuid: string, userId: string): Promise<ChatEntity> {
    return await this.prisma.chat.findUniqueOrThrow({
      where: {
        uuid,
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: true,
        messages: {
          take: 30,
          orderBy: {
            createdAt: "asc"
          },
        },
      }
    }).catch(_ => {
      throw new NotFoundException("Chat não encontrado!")
    }) as unknown as ChatEntity;
  }

  async removeChat(uuid: string, userId: string): Promise<void> {
    await this.findOneChat(uuid, userId);
    await this.prisma.chat.delete({
      where: { uuid },
    });
  }

  async chatsIdsWithUnreadyMessages(user: User): Promise<any> {
  const chats = await this.prisma.chat.findMany({
    where: {
      participants: {
        some: {
          userId: user.uuid,
        },
      },
      messages: {
        some: {
          isRead: false,
        },
      },
    },
    include:{
      participants: true,
      messages: true
    }
  });

  return { chats };
}

  /**
    * Busca um usuário pelo endereço de e-mail associado à autenticação.
    * @param email - Endereço de e-mail do usuário.
    * @returns Uma instância de UsuarioEntity ou null se não encontrado.
  */
  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        auth: {
          email
        }
      },
      include: {
        auth: true
      }
    });

    if (!user) {
      return null;
    }

    return user as unknown as UserEntity;
  }

  async messageNotRead(user: User): Promise<Message[]> {
    try {
      const chats = await this.prisma.message.findMany({
        where: {
          isRead: false,
          receiverId: user.uuid,
          deletedLocally: false
        },
      });
      return chats as unknown as Message[];
    } catch (error) {
      console.error('Error fetching unread chats:', error);
      throw new Error('Could not fetch unread chats');
    }
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.query.token as string;

    if (!token) {
      this.logger.warn('Token não fornecido');
      client.disconnect();
      return;
    }

    try {
      const payload: any = jwt.decode(token);
      const user = await this.findByEmail(payload?.email || "");

      if (!user) {
        this.logger.warn('User not found');
        client.disconnect();
        return;
      }

      client.data.userId = user.uuid;
      client.data.user = user;

      const idsChats = await this.chatsIdsWithUnreadyMessages(user as unknown as User);
      client.emit("idsChats", idsChats);

      const messagesdeleted = await this.listMessageRemoved(user as unknown as User)

      if (messagesdeleted.length > 0)
        client.emit("listMessageRemoved", messagesdeleted)

      const listMessagesUpdated = await this.listMessagUpdated(user as unknown as User)
      if (listMessagesUpdated.length > 0)
        client.emit("listMessagesUpdated", listMessagesUpdated)


      if (!this.userConnections.has(user.uuid)) {
        this.userConnections.set(user.uuid, new Set());
      }
      this.userConnections.get(user.uuid)?.add(client.id);

      this.logger.log(`Client connected with userId: ${user.uuid}`);
    } catch (error) {
      this.logger.error('Token inválido ou expirado', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const connections = this.userConnections.get(userId);
      connections?.delete(client.id);
      if (connections && connections.size === 0) {
        this.userConnections.delete(userId);
      }
    }
    this.logger.log(`Client disconnected: ${userId}`);
  }

  /**
   * Envia uma mensagem para um usuário específico.
   * @param user - O destinatário da mensagem
   * @param message - A mensagem a ser enviada
   */
  async sendMessageToUser(userId: string, message: Message) {
    const socketIds = this.userConnections.get(userId);

    if (socketIds) {
      socketIds.forEach(socketId => {
        const clientSocket = this.server.sockets.sockets.get(socketId);
        if (clientSocket) {
          clientSocket.emit('message', { ...message });
        }
      });
    } else {
      this.logger.warn(`No active connections for user`);
    }
  }

  /**
   * Emite um evento 'messageReady' para todos os sockets ativos de um usuário,
   * informando que as mensagens de um determinado chat foram lidas.
   *
   * Este método é responsável por enviar um sinal para todos os clientes conectados,
   * notificando-os que o usuário com o ID `userId` leu as mensagens do chat
   * com o ID `chatId`. Caso o usuário não tenha conexões ativas, um aviso 
   * será registrado no log.
   *
   * @param userId - O ID do usuário que leu as mensagens.
   * @param chatId - O ID do chat em que as mensagens foram lidas.
   */
  async messageRead(userId: string, chatId: string): Promise<void> {
    const socketIds = this.userConnections.get(userId);

    if (!socketIds || socketIds.size === 0) {
      this.logger.warn(`No active socket connections found for user: ${userId}`);
      return;
    }

    for (let socketId of socketIds) {
      const clientSocket = this.server.sockets.sockets.get(socketId);

      if (clientSocket) {
        try {
          clientSocket.emit('messageReady', { chatId, userId });
          this.logger.debug(`Emitted 'messageReady' for user ${userId} in chat ${chatId}`);
        } catch (error) {
          this.logger.error(`Failed to emit 'messageReady' for user ${userId} in chat ${chatId}: ${error.message}`);
        }
      } else {
        this.logger.warn(`No active socket found for socketId ${socketId}`);
      }
    }
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: { recipientId: string; message: string }): void {
    const { recipientId, message } = payload;
    const senderId = client.data.userId;

    if (!recipientId || !message) {
      this.logger.warn('Invalid message payload');
      return;
    }

    this.logger.log(`Received message: ${message} from client: ${senderId}`);

    const recipientSockets = this.userConnections.get(recipientId);
    if (recipientSockets) {
      recipientSockets.forEach(socketId => {
        const recipientSocket = this.server.sockets.sockets.get(socketId);
        if (recipientSocket) {
          recipientSocket.emit('message', { message, senderId });
        }
      });
    } else {
      this.logger.warn(`Recipient with ID ${recipientId} not found`);
    }
  }

  messageRemove(ids: { uuid: string }[], userId: string) {
    const socketIds = this.userConnections.get(userId);

    if (socketIds) {
      socketIds.forEach(socketId => {
        const clientSocket = this.server.sockets.sockets.get(socketId);
        if (clientSocket) {
          clientSocket.emit('removeMessages', ids);
        }
      });
    } else {
      this.logger.warn(`No active connections for user`);
    }
  }

  updateMessage(message: Message): void {
    const socketIds = this.userConnections.get(message.receiverId || "");

    if (socketIds) {
      socketIds.forEach(socketId => {
        const clientSocket = this.server.sockets.sockets.get(socketId);
        if (clientSocket) {
          clientSocket.emit('updateMessage', message);
        }
      });
    } else {
      this.logger.warn(`No active connections for user`);
    }
  }

  async listMessageRemoved(user: User): Promise<Array<string>> {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          {
            deletedLocally: true,
            senderId: user.uuid
          },
          {
            deletedLocally: true,
            receiverId: user.uuid
          }
        ]

      },
      select: {
        uuid: true
      }
    })

    return messages.map(e => e.uuid)
  }

  async listMessagUpdated(user: User): Promise<Array<Message>> {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          {
            isUpdate: true,
            senderId: user.uuid
          },
          {
            isUpdate: true,
            receiverId: user.uuid
          }
        ]

      },
    })

    return messages
  }

  /**
   * Notifica os contatos/participantes de chats de um usuário sobre uma atualização no perfil dele.
   * @param uuid uuid do usuário.
   * @param action A ação que ocorreu (ex: 'update').
   */
  async notifyContactsOfUserUpdate(uuid: string, action: 'update' | 'create' | 'delete', {src, ...data}: any) {
    console.log(`Atualizando user, ${uuid}`)
    const chats = await this.prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId: uuid,
          },
        },
      },
      include: {
        participants: {
          select: {
            userId: true,
          },
        },
      },
    });

    console.log(chats)

    const notifiedUsers = new Set<string>();

    for (const chat of chats) {
      for (const participant of chat.participants) {
        const contactId = participant.userId;
        if (contactId === uuid || notifiedUsers.has(contactId)) {
          continue;
        }
        notifiedUsers.add(contactId);
        const socketIds = this.userConnections.get(contactId);
        if (socketIds) {
          socketIds.forEach(socketId => {
            const clientSocket = this.server.sockets.sockets.get(socketId);
            if (clientSocket) {
              clientSocket.emit('contactProfileUpdated', {
                action: action,
                userId: uuid,
                data
              });
              this.logger.log(`'contactProfileUpdated' event emitted for contact ${contactId} about user ${uuid}.`);
            }
          });
        }
      }
    }
  }

  async notifyContactsOfImageProfileUpdate(uuid: string, userId: string, action: 'update' | 'create' | 'delete', {src, ...data}: any) {
    const chats = await this.prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        participants: {
          select: {
            userId: true,
          },
        },
      },
    });

    const notifiedUsers = new Set<string>();
    for (const chat of chats) {
      for (const participant of chat.participants) {
        const contactId = participant.userId;
        if (contactId === userId || notifiedUsers.has(contactId)) {
          continue;
        }
        notifiedUsers.add(contactId);

        const socketIds = this.userConnections.get(contactId);
        if (socketIds) {
          socketIds.forEach(socketId => {
            const clientSocket = this.server.sockets.sockets.get(socketId);
            if (clientSocket) {
              clientSocket.emit('contactImageProfileUpdated', {
                action: action,
                userId: userId, 
                data: { uuid, ...data}
              });
          this.logger.log(`'contactImageProfileUpdated' event emitted for contact ${contactId} about user ${userId}'s image.`);
        }
      });
    }
  }
}
  }
}
