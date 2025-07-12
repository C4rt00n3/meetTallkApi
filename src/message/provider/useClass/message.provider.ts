import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Chat, Message, User } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { ChatGateway } from "src/gateway/chat.gateway";
import { MessageProvider } from "../message.provider";
import { CreateMessageDto } from "src/message/dto/create-message.dto";
import { UpdateMessageDto } from "src/message/dto/update-message.dto";
import { promises } from "dns";
import { randomUUID } from "crypto";

@Injectable()
export class MensageClass implements MessageProvider {

    constructor(
        private readonly prisma: PrismaService,
        private readonly chatGetawy: ChatGateway
    ) { }

    /**
     * Cria uma nova mensagem e associa a um chat.
     * Se o chat não existir, ele será criado.
     * @param createMessageDto - DTO contendo os dados da mensagem.
     * @param user - O usuário que está enviando a mensagem.
     * @returns A mensagem criada ou null.
     */
    async create(createMessageDto: CreateMessageDto, user: User): Promise<Message | null> {
        const { receiverId } = createMessageDto;

        const count = await this.prisma.user.count({
            where: { uuid: receiverId }
        });

        if (count == 0) {
            throw new NotFoundException("Usuário destinatário não encontrado!");
        }

        const countBlocks = await this.prisma.block.count({
            where: {
                OR: [
                    { blockedUserId: receiverId, userId: user.uuid },
                    { blockedUserId: user.uuid, userId: receiverId }
                ]
            }
        });

        if (countBlocks > 0) {
            throw new UnauthorizedException("Você não tem permissão para enviar mensagens para este usuário.");
        }

        let chat = await this.prisma.chat.findFirst({
            where: {
                participants: {
                    some: { userId: user.uuid }
                },
                AND: {
                    participants: {
                        some: { userId: receiverId }
                    }
                }
            }
        });

        if (!chat) {
            chat = await this.prisma.chat.create({
                data: {}
            });

            // Cria os participantes apenas se não existirem
            await this.prisma.chatParticipant.createMany({
                data: [
                    { chatId: chat.uuid, userId: user.uuid },
                    { chatId: chat.uuid, userId: receiverId }
                ],
                skipDuplicates: true // <- ESSENCIAL PARA EVITAR O ERRO
            });
        }

        if (createMessageDto.createdAt == null) {
            delete createMessageDto.createdAt
        }

        const message = await this.prisma.message.create({
            data: {
                ...createMessageDto,
                chatId: chat.uuid,   // define o ID do chat
                senderId: user.uuid  // define o remetente
            },
        });

        console.log(message)

        this.chatGetawy.sendMessageToUser(receiverId, message)

        await this.prisma.chat.update({
            where: { uuid: chat.uuid },
            data: { lastMessageDate: message.createdAt },
            include: {
                participants: {
                    include: {
                        user: {
                            include: {
                                auth: false,
                            }
                        }
                    }
                }
            }
        });

        return message;
    }

    /**
     * Atualiza uma mensagem existente.
     * @param uuid - O identificador único da mensagem.
     * @param updateMensageDto - DTO contendo os dados atualizados da mensagem.
     * @param user - O usuário que está atualizando a mensagem.
     * @returns A mensagem atualizada ou null.
     * @throws NotFoundException se a mensagem não for encontrada.
     */
    async update(
        uuid: string,
        { text, ...updateMessageDto }: UpdateMessageDto,
        user: User
    ): Promise<Message | null> {

        const message = await this.findOne(uuid, user);

        if (message?.createdAt) {
            const dataOriginal = new Date(message.createdAt);

            // Verifica se a data é válida
            if (!isNaN(dataOriginal.getTime())) {
                const agora = new Date();
                const diffMs = agora.getTime() - dataOriginal.getTime();

                const passou15Min = diffMs > 15 * 60 * 1000;

            } else {
                throw new UnauthorizedException("Limite de tempo 15 minutos!")
            }
        }

        if (!message) throw new NotFoundException("Mensagem não encontrada");

        if (message.countUpdate >= 3) throw new UnauthorizedException("Você não pode mais editar :(")


        const newMessage = await this.prisma.message.update({
            where: { uuid, deletedLocally: false },
            data: {
                text,
                isUpdate: true,
                countUpdate: message.countUpdate + 1
            },
        });

        this.chatGetawy.updateMessage(newMessage);

        return newMessage;
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
                                age: true,
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

        console.log(safe)
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

}