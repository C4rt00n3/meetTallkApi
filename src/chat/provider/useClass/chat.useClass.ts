import { IPaginationOptions } from "nestjs-typeorm-paginate";
import ChatProvider from "../chat.provider";
import { PrismaService } from "src/prisma.service";
import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { WebSocketServer } from "@nestjs/websockets";
import { Server } from 'socket.io';
import { Chat, User } from "@prisma/client";
import { error } from "console";

/**
 * Classe responsável por gerenciar operações relacionadas ao modelo Chat utilizando o PrismaService.
 * Implementa a interface ChatProvider.
 */
@Injectable()
export class ChatClass implements ChatProvider {
    @WebSocketServer() server: Server;

    /**
     * Construtor da classe ChatClass
     * @param prisma - Instância do PrismaService para realizar operações no banco de dados.
     */
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Busca todos os chats em que o usuário especificado participa.
     * @param user - Usuário atual para o qual os chats serão retornados.
     * @param options - Opções de paginação (não utilizadas atualmente no método).
     * @returns Uma lista de chats nos quais o usuário é participante.
     */
    async findAll(user: User, { page, limit }: IPaginationOptions, name: string): Promise<Chat[]> {
        const pageNumber = Number(page) || 1;
        const limitNumber = Number(limit) || 10;

        return await this.prisma.chat.findMany({
            where: {
                AND: [
                    { participants: { some: { user: { uuid: user.uuid } } } },
                    {
                        participants: {
                            some: {
                                user: {
                                    name: { contains: name.trim() }
                                }
                            }
                        }
                    }
                ]
            },
            include: {
                participants: { include: { user: {
                    include: {
                        profileImages: {
                            select: {
                                uuid: true
                            }
                        }
                    }
                } } },
                messages: true
            },
            take: limitNumber,
            skip: (pageNumber - 1) * limitNumber
        });
    }

    /**
     * Busca um chat específico pelo UUID, garantindo que o usuário seja participante.
     * @param uuid - Identificador único do chat.
     * @param user - Usuário atual que deve ser um participante do chat.
     * @returns O chat encontrado ou null se não existir ou o usuário não for participante.
     */
    async findOne(uuid: string, user: User): Promise<Chat> {
        const chat = await this.prisma.chat.findFirst({
            where: {
                uuid,
                participants: {
                    some: {
                        user: user
                    }
                }
            },
            include: {
                participants: { include: { user: {
                    include: {
                        profileImages: {
                            select: {
                                uuid: true
                            }
                        }
                    }
                } } },
                messages: true
            }
        });

        if (!chat) {
            throw new NotFoundException("Não encontrado!");
        }

        return chat;
    }

    /**
     * Remove um chat específico pelo UUID, garantindo que o usuário seja participante.
     * @param uuid - Identificador único do chat a ser removido.
     * @param user - Usuário atual que deve ser um participante do chat.
     * @throws Exceção se o chat não existir ou o usuário não for participante.
     */
    async remove(uuid: string, user: User): Promise<void> {
        await this.prisma.chat.delete({
            where: {
                uuid,
                participants: {
                    some: {
                        user: user
                    }
                }
            }
        });
    }

    async markFav(uuid: string, user: User): Promise<User> {
        const {fav} = await this.prisma.chat.findUniqueOrThrow({
            where: {
                uuid,
                participants: {
                    some: {
                        user: user
                    }
                }
            }
        }).then(e => e).catch(_ => {throw new NotFoundException("Não encontrado!")})

        return await this.prisma.chat.update({
            where: {
                uuid,
            },
            data: {
                fav: !fav
            },
            include: {
                participants: false,
                messages: false
            }
        }) as unknown as User;
    }
}
