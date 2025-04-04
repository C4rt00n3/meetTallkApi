import { Usuario, Chat } from "@prisma/client";
import { IPaginationOptions } from "nestjs-typeorm-paginate";
import ChatProvider from "../chat.provider";
import { PrismaService } from "src/prisma.service";
import { Injectable } from "@nestjs/common";

/**
 * Classe responsável por gerenciar operações relacionadas ao modelo Chat utilizando o PrismaService.
 * Implementa a interface ChatProvider.
 */
@Injectable()
export class ChatClass implements ChatProvider {

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
    async findAll(user: Usuario, { page, limit }: IPaginationOptions, nome: string): Promise<Chat[]> {
        const pageNumber = Number(page) || 1;
        const limitNumber = Number(limit) || 10;
    
        return await this.prisma.chat.findMany({
            where: {
                AND: [
                    { participantes: { some: { usuario: { uuid: user.uuid } } } },
                    {
                        participantes: {
                            some: {
                                usuario: {
                                    nome: { contains: nome.trim()}
                                }
                            }
                        }
                    }
                ]
            },
            include: {
                participantes: { include: { usuario: true } },
                mensagens: true
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
    async findOne(uuid: string, user: Usuario): Promise<Chat | null> {
        return await this.prisma.chat.findFirst({
            where: {
                uuid,
                participantes: {
                    some: {
                        usuario: user
                    }
                }
            },
            include: {
                participantes: { include: { usuario: true } },
                mensagens: true
            }
        });
    }

    /**
     * Remove um chat específico pelo UUID, garantindo que o usuário seja participante.
     * @param uuid - Identificador único do chat a ser removido.
     * @param user - Usuário atual que deve ser um participante do chat.
     * @throws Exceção se o chat não existir ou o usuário não for participante.
     */
    async remove(uuid: string, user: Usuario): Promise<void> {
        await this.prisma.chat.delete({
            where: {
                uuid,
                participantes: {
                    some: {
                        usuario: user
                    }
                }
            }
        });
    }
}
