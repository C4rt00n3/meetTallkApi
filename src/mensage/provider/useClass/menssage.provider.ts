import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Chat, Menssagem, Usuario } from "@prisma/client";
import { CreateMensageDto } from "src/mensage/dto/create-mensage.dto";
import { UpdateMensageDto } from "src/mensage/dto/update-mensage.dto";
import { MenssageProvider } from "../mensage.provider";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class MensageClass implements MenssageProvider {

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Cria uma nova mensagem e associa a um chat.
     * Se o chat não existir, ele será criado.
     * @param createMensageDto - DTO contendo os dados da mensagem.
     * @param user - O usuário que está enviando a mensagem.
     * @returns A mensagem criada ou null.
     */
    async create(createMensageDto: CreateMensageDto, user: Usuario): Promise<Menssagem | null> {
        let chat = await this.prisma.chat.findFirst({
            where: {
                participantes: {
                    some: { chat_uuid: createMensageDto.recieve_id }
                }
            }
        });

        const blocks = await this.prisma.block.findMany({
            where: {
                OR: [
                    {
                        blockedUserId: createMensageDto.recieve_id,
                        usuarioUuid: user.uuid
                    },
                    {
                        blockedUserId: user.uuid,
                        usuarioUuid: createMensageDto.recieve_id
                    }
                ]
            }
        })

        if(blocks.length > 0)
            throw new UnauthorizedException("Sem autorização ;)")

        if (!chat) {
            chat = await this.prisma.chat.create({ data: {} });

            await this.prisma.chatHasChat.createMany({
                data: [
                    { chat_idtable1: chat.uuid, chat_uuid: user.uuid },
                    { chat_idtable1: chat.uuid, chat_uuid: createMensageDto.recieve_id }
                ]
            });
        }

        const mensagem = await this.prisma.menssagem.create({
            data: {
                ...createMensageDto,
                chat_uuid: chat.uuid,
                sender_id: user.uuid,
            }
        });

        await this.prisma.chat.update({
            where: { uuid: chat.uuid },
            data: { lastDateMensage: mensagem.createdAt }
        });

        return mensagem;
    }

    /**
     * Atualiza uma mensagem existente.
     * @param uuid - O identificador único da mensagem.
     * @param updateMensageDto - DTO contendo os dados atualizados da mensagem.
     * @param user - O usuário que está atualizando a mensagem.
     * @returns A mensagem atualizada ou null.
     * @throws NotFoundException se a mensagem não for encontrada.
     */
    async update(uuid: string, { recieve_id, ...updateMensageDto }: UpdateMensageDto, user: Usuario): Promise<Menssagem | null> {
        const mensage = await this.findOne(uuid, user);

        if (!mensage) throw new NotFoundException("Mensagem não encontrada");

        return await this.prisma.menssagem.update({
            where: { uuid },
            data: updateMensageDto
        });
    }

    /**
     * Retorna uma mensagem pelo UUID e usuário.
     * @param uuid - O identificador único da mensagem.
     * @param user - O usuário solicitante.
     * @returns A mensagem encontrada ou null.
     */
    async findOne(uuid: string, user: Usuario): Promise<Menssagem | null> {
        return await this.prisma.menssagem.findFirst({
            where: { uuid, sender_id: user.uuid },
        });
    }

    /**
     * Retorna todos os chats de um usuário com suas mensagens.
     * @param user - O usuário solicitante.
     * @returns Uma lista de chats ordenados pela mensagem mais recente.
     */
    async findAll(user: Usuario): Promise<Chat[]> {
        return await this.prisma.chat.findMany({
            where: {
                participantes: {
                    some: { chat_uuid: user.uuid }
                }
            },
            include: {
                mensagens: { orderBy: { createdAt: 'desc' } },
                participantes: { include: { usuario: true } }
            },
            orderBy: { lastDateMensage: 'desc' }
        });
    }

    /**
     * Exclui uma mensagem pelo UUID e usuário.
     * @param uuid - O identificador único da mensagem.
     * @param user - O usuário solicitante.
     * @throws NotFoundException se a mensagem não for encontrada.
     */
    async delete(uuid: string, user: Usuario): Promise<void> {
        const mensage = await this.findOne(uuid, user);
        if (!mensage) throw new NotFoundException("Mensagem não encontrada");

        await this.prisma.menssagem.delete({
            where: { uuid }
        });
    }
}
