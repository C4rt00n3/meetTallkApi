import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Chat, Message, MessageType, User } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { ChatGateway } from "src/gateway/chat.gateway";
import { MessageProvider } from "../message.provider";
import { CreateMessageDto } from "src/message/dto/create-message.dto";
import { UpdateMessageDto } from "src/message/dto/update-message.dto";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MensageClass implements MessageProvider {

  constructor(
    private readonly prisma: PrismaService,
    private readonly chatGetawy: ChatGateway
  ) { }

  // ... imports e MensageClass ...

async onModuleInit() {
  console.log('Inicializando middleware do Prisma para Message...');
  this.observerMessages();
}

async observerMessages() {
  this.prisma.$use(async (params, next) => {
    const result = await next(params);

    if (params.model === 'Message') {
      switch (params.action) {
        case "create":
          if (result) {
            const messageToSend = { ...result };

            if (messageToSend.ImageMessage && messageToSend.ImageMessage.src) {
              delete messageToSend.ImageMessage.src;
            }

            this.chatGetawy.sendMessageToUser(messageToSend.receiverId, messageToSend);
            console.log(`[MIDDLEWARE - MESSAGE] Mensagem criada (UUID: ${result.uuid}) enviada para o receptor.`);
          }
          break; 

        case "update":
          if (result) {
            const messageToSend = { ...result };
            if (messageToSend.ImageMessage && messageToSend.ImageMessage.src) {
              delete messageToSend.ImageMessage.src;
            }

            this.chatGetawy.updateMessage(messageToSend);
            console.log(`[MIDDLEWARE - MESSAGE] Mensagem atualizada (UUID: ${result.uuid}) enviada.`);
          }
          break;

        case "delete":
          console.log(`[MIDDLEWARE - MESSAGE] Operação de deleção detectada.`);
          break;

        default:
          break;
      }
    }

    // 4. Retorne o resultado original da operação do Prisma.
    return result;
  });
}

  /**
   * Cria uma nova mensagem e associa a um chat.
   * Se o chat não existir, ele será criado.
   * @param createMessageDto - DTO contendo os dados da mensagem.
   * @param user - O usuário que está enviando a mensagem.
   * @param file - O arquivo da imagem (opcional).
   * @returns A mensagem criada ou null.
   */
  async create(
    createMessageDto: CreateMessageDto,
    user: User,
    file?: Express.Multer.File,
  ): Promise<Message | null> {

    if (createMessageDto.type === MessageType.IMAGE) {
      console.log(file)
      if (!file) {
        throw new BadRequestException('Imagem vazia para mensagem do tipo IMAGE.');
      }
    }

    const { receiverId } = createMessageDto;

    // 1. Validação de usuário destinatário
    const count = await this.prisma.user.count({
      where: { uuid: receiverId },
    });
    if (count === 0) {
      throw new NotFoundException('Usuário destinatário não encontrado!');
    }

    // 2. Validação de bloqueio
    const countBlocks = await this.prisma.block.count({
      where: {
        OR: [
          { blockedUserId: receiverId, userId: user.uuid },
          { blockedUserId: user.uuid, userId: receiverId },
        ],
      },
    });

    if (countBlocks > 0) {
      throw new UnauthorizedException(
        'Você não tem permissão para enviar mensagens para este usuário.',
      );
    }

    // 3. Encontrar ou Criar Chat
    let chat = await this.prisma.chat.findFirst({
      where: {
        participants: {
          some: { userId: user.uuid },
        },
        AND: {
          participants: {
            some: { userId: receiverId },
          },
        },
      },
    });

    if (!chat) {
      chat = await this.prisma.chat.create({
        data: {}, // Pode adicionar um nome de chat aqui se for o caso
      });

      // Cria os participantes para o novo chat
      await this.prisma.chatParticipant.createMany({
        data: [
          { chatId: chat.uuid, userId: user.uuid },
          { chatId: chat.uuid, userId: receiverId },
        ],
        skipDuplicates: true, // Essencial para evitar erros se por algum motivo já existirem
      });
    }

    // 4. Preparar dados da mensagem
    const messageData: any = {
      uuid: uuidv4(),
      text: createMessageDto.text,
      type: createMessageDto.type,
      chatId: chat.uuid, // Define o ID do chat
      senderId: user.uuid, // Define o remetente
      receiverId: createMessageDto.receiverId, // Define o destinatário
      // createdAt é opcional no DTO, o Prisma lida com undefined
      ...(createMessageDto.createdAt && {
        createdAt: new Date(createMessageDto.createdAt),
      }),
      ...(createMessageDto.replyToId && {
        replyToId: createMessageDto.replyToId,
      }),
    };

    // 5. Lógica para ImageMessage (se o tipo for IMAGEM e um arquivo for fornecido)
    if (createMessageDto.type === MessageType.IMAGE) {
      if (!file) {
        throw new BadRequestException('Imagem vazia para mensagem do tipo IMAGE.');
      }
      // Adiciona a lógica de criação da ImageMessage aninhada
      messageData.ImageMessage = {
        create: {
          uuid: uuidv4(),
          src: file.buffer, // O buffer do arquivo é o conteúdo binário da imagem
          userUuid: user.uuid, // Opcional: associa a imagem ao usuário que a enviou
        },
      };
    }

    // 6. Criação da Mensagem
    const message = await this.prisma.message.create({
      data: messageData,
      // Inclui a ImageMessage na resposta se ela foi criada
      include: {
        ImageMessage: {
          select: {
            uuid: true,
            messageUuid: true,
            message: true
          }
        },
      },
    });

    // 7. Atualiza a última mensagem do chat
    await this.prisma.chat.update({
      where: { uuid: chat.uuid },
      data: { lastMessageDate: message.createdAt },
      include: {
        participants: {
          include: {
            user: {
              include: {
                auth: false, // Exclui dados de autenticação do usuário
              },
            },

          },
        },
      },
    });

    return message;
  }

 /**
 * Atualiza uma mensagem existente.
 * @param uuid - O identificador único da mensagem.
 * @param updateMessageDto - DTO contendo os dados atualizados da mensagem.
 * @param user - O usuário que está atualizando a mensagem.
 * @returns A mensagem atualizada.
 * @throws NotFoundException se a mensagem não for encontrada ou o usuário não tiver permissão.
 * @throws UnauthorizedException se o limite de tempo ou de edições for excedido.
 * @throws BadRequestException se a data de criação for inválida.
 */
async update(
  uuid: string,
  { text }: UpdateMessageDto, // Desestruturar apenas 'text' pois é o único campo usado do DTO
  user: User
): Promise<Message> { // Alterado para Promise<Message> pois sempre lançará exceção ou retornará Message

  // 1. Encontra a mensagem e verifica permissão.
  // O método findOne já deve incluir a verificação se o usuário é o sender ou receiver.
  const message = await this.findOne(uuid, user);

  // Se a mensagem não for encontrada ou o usuário não tiver permissão para acessá-la, lança erro.
  // Esta verificação deve ser a primeira, antes de tentar acessar propriedades de 'message'.
  if (!message) {
    throw new NotFoundException("Mensagem não encontrada ou você não tem permissão para editá-la.");
  }

  // 2. Validação da data de criação da mensagem (limite de 15 minutos).
  const createdAtDate = new Date(message.createdAt); // createdAt do Prisma já é um objeto Date

  // Verifica se a data é válida. Se for NaN (Not-a-Number), indica uma data inválida.
  if (isNaN(createdAtDate.getTime())) {
    throw new BadRequestException("Data de criação da mensagem inválida.");
  }

  const now = new Date();
  const diffMs = now.getTime() - createdAtDate.getTime();
  const fifteenMinutesInMillis = 15 * 60 * 1000;

  if (diffMs > fifteenMinutesInMillis) {
    throw new UnauthorizedException("Limite de tempo para edição (15 minutos) excedido.");
  }

  // 3. Validação do limite de edições.
  if (message.countUpdate >= 3) {
    throw new UnauthorizedException("Você não pode mais editar esta mensagem (limite de 3 edições).");
  }

  // 4. Atualiza a mensagem no banco de dados.
  const updatedMessage = await this.prisma.message.update({
    where: { uuid, deletedLocally: false },
    data: {
      uuid,
      text,
      receiverId: message.receiverId,
      senderId: message.senderId,
      isUpdate: true,
      countUpdate: message.countUpdate + 1,
    },
    include: {
        ImageMessage: { select: { uuid: true } }, 
    }
  });

  // 5. Retorna a mensagem atualizada.
  return updatedMessage;
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

  /**
   * Retorna uma mensagem pelo UUID e usuário.
   * @param uuid - O identificador único da mensagem.
   * @param user - O usuário solicitante.
   * @returns A mensagem encontrada ou null.
   */
  async findOne(uuid: string, user: User): Promise<Message | null> {
    return await this.prisma.message.findFirst({
      where: {
        uuid, senderId: user.uuid,
        deletedLocally: false
      },
    });
  }

  /**
   * Retorna todos os chats de um usuário com suas mensagens.
   * @param user - O usuário solicitante.
   * @returns Uma lista de chats ordenados pela mensagem mais recente.
   */
  async findAll(user: User): Promise<Chat[]> {
    return await this.prisma.chat.findMany({
      where: {
        participants: {
          some: {
            user: {
              uuid: user.uuid
            }
          }
        }
      },
      include: {
        messages: false,
        participants: {
          include: {
            user: {
              select: {
                uuid: true,
                name: true,
                locationId: true,
                gender: true,
                birthDate: true,
                privacyUser: true,
                profileImages: {
                  select: {
                    uuid: true,
                    userUuid: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        lastMessageDate: 'desc'
      }
    });
  }

  /**
   * Exclui uma mensagem pelo UUID e usuário.
   * @param uuid - O identificador único da mensagem.
   * @param user - O usuário solicitante.
   * @throws NotFoundException se a mensagem não for encontrada.
   */
  async delete(ids: string[], user: User, { safe }: { safe: boolean } = { safe: false }): Promise<void> {
    const mensagens = await this.prisma.message.findMany({
      where: {
        uuid: { in: ids },
      },
      select: {
        uuid: true,
        receiverId: true
      }
    });

    if (mensagens.length !== ids.length) {
      throw new NotFoundException("Uma ou mais mensagens não foram encontradas ou não pertencem ao usuário.");
    }

    if (mensagens[0].receiverId)
      this.chatGetawy.messageRemove(mensagens, mensagens[0].receiverId);

    if (!safe) {
      await this.prisma.message.updateMany({
        where: {
          uuid: { in: ids },
          deletedLocally: false,
          OR: [
            { senderId: user.uuid, },
          ]
        },
        data: {
          deletedLocally: true
        }
      });
    } else {
      await this.prisma.message.deleteMany({
        where: {
          OR: [
            {
              uuid: { in: ids },
              senderId: user.uuid
            },
            {
              uuid: { in: ids },
              receiverId: user.uuid,
            }
          ]
        }
      });
    }
  }

  /**
   * Marca todas as mensagens de um chat como lidas para um usuário específico
   * e emite um evento 'chatRead' para todos os participantes do chat, exceto o remetente.
   *
   * @param uuid - O ID do chat cujas mensagens serão marcadas como lidas.
   * @param user - O usuário que está marcando as mensagens como lidas.
   */
  async markRead(uuid: string, user: User): Promise<void> {
    await this.prisma.message.updateMany({
      where: {
        chatId: uuid,
        NOT: {
          senderId: user.uuid
        },
        deletedLocally: false
      },
      data: {
        isRead: true
      },
    });

    const chat = await this.prisma.chat.findFirst({
      where: {
        uuid: uuid
      },
      include: {
        participants: true
      }
    });

    if (!chat)
      throw new BadRequestException(`Chat com ID ${uuid} não encontrado.`);

    if (!chat.participants)
      throw new BadRequestException(`Nenhum participante encontrado para o chat ${uuid}`);

    const otherParticipants = chat.participants.filter(participant => participant.userId !== user.uuid);

    for (const participant of otherParticipants) {
      await this.chatGetawy.messageRead(participant.userId, uuid);
    }
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

  async getImageMessage(uuid: string, chat_uuid: string, user: User) {
    return await this.prisma.imageMessage.findFirstOrThrow({
      where: {
        uuid,
        message: {
          chatId: chat_uuid,
          chat: {
            participants: {
              some: { userId: user.uuid },
            },
          }
        }
      }
    })
  }
}