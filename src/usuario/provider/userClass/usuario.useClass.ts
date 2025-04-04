import { Usuario } from "@prisma/client";
import { FindUsariosParams, UsuarioDto, UpdateUsuarioDto } from "src/usuario/dto/usuario.dto";
import { PrismaService } from "src/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { UsuarioProvider } from "../usuario.provider";
import { UsuarioEntity } from "src/usuario/entities/usuario.entity";


@Injectable()
export default class UsuarioClass implements UsuarioProvider {
    /**
     * Classe responsável por gerenciar operações CRUD no modelo Usuario utilizando o PrismaService.
     */
    constructor(private prisma: PrismaService) { }

    /**
     * Busca um usuário que corresponda aos critérios fornecidos.
     * @param params - Parâmetros de busca definidos na interface FindUsariosParams.
     * @returns Retorna o primeiro usuário encontrado ou null se não houver correspondência.
     */
    async find(params: FindUsariosParams): Promise<Usuario | null> {
        return await this.prisma.usuario.findFirst({
            where: { ...params }
        });
    }

    calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Raio da Terra em km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distância em km
    }

    /**
     * Busca múltiplos usuários que correspondam aos critérios fornecidos.
     * @param params - Parâmetros de busca definidos na interface FindUsariosParams.
     * @returns Uma lista de usuários encontrados ou uma lista vazia caso nenhum corresponda aos critérios.
     */
    async findMany({ nome = "" }: FindUsariosParams, user: UsuarioEntity): Promise<Usuario[]> {
        const usuarios = await this.prisma.usuario.findMany({
            where: {
                nome: { contains: nome.trim() },
            },
            include: { localizacao: true }
        });

        return usuarios
            .map(usuario => ({
                ...usuario,
                distancia: this.calcularDistancia(
                    parseFloat(user.localizacao?.Lat || "0"),
                    parseFloat(user.localizacao?.Lng || "0"),
                    parseFloat(usuario.localizacao?.Lat || "0"),
                    parseFloat(usuario.localizacao?.Lng || "0")
                )
            }))
            .sort((a, b) => a.distancia - b.distancia); // Ordena do mais próximo para o mais distante
    }

    /**
  * Cria um novo usuário com base nos dados fornecidos.
  * @param body - Objeto de transferência de dados (DTO) contendo as informações do usuário e autenticação.
  * @returns O usuário criado.
  */
    async create({
        autenticacao,
        localizacao,
        ...body
    }: UsuarioDto): Promise<Usuario> {
        return await this.prisma.usuario.create({
            data: {
                ...body,
                autenticacao: { create: { ...autenticacao } },
                localizacao: localizacao?.Lng && localizacao?.Lat
                    ? { create: localizacao }
                    : undefined
            },
            include: {
                localizacao: true
            }
        });
    }

    /**
     * Atualiza um usuário existente com base no UUID fornecido.
     * @param data - Dados de atualização do usuário encapsulados no DTO UpdateUsuarioDto.
     * @param uuid - Identificador único do usuário a ser atualizado.
     * @returns O usuário atualizado ou lança uma exceção se não encontrado.
     * @throws NotFoundException - Se o usuário não for encontrado pelo UUID.
     */
    async update(
        { autenticacao, localizacao, ...data }: UpdateUsuarioDto,
        uuid: string
    ): Promise<Usuario | null> {
        const user = await this.findUnique(uuid);

        if (!user) {
            throw new NotFoundException("Usuário não encontrado!");
        }

        return await this.prisma.usuario.update({
            where: { uuid },
            data: {
                ...data,
                localizacao: localizacao?.Lng && localizacao?.Lat
                    ? {
                        upsert: {
                            create: localizacao,
                            update: localizacao
                        }
                    }
                    : undefined
            },
            include: {
                localizacao: true
            }
        });
    }

    /**
     * Busca um usuário pelo UUID.
     * @param uuid - Identificador único do usuário.
     * @returns O usuário encontrado ou lança uma exceção se não encontrado.
     * @throws NotFoundException - Se o usuário não for encontrado pelo UUID.
     */
    async findUnique(uuid: string): Promise<Usuario | null> {
        try {
            return await this.prisma.usuario.findUniqueOrThrow({
                where: { uuid },
                include: {
                    localizacao: true
                }
            });
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException("Usuário não encontrado");
            }
            throw error;
        }
    }

    /**
     * Exclui um usuário com base no UUID fornecido e remove sua autenticação.
     * @param uuid - Identificador único do usuário a ser excluído.
     * @throws NotFoundException - Se o usuário não for encontrado pelo UUID.
     */
    async delete(uuid: string) {
        const user = await this.findUnique(uuid);

        await this.prisma.usuario.delete({ where: { uuid } });

        if (user) {
            await this.prisma.chatHasChat.deleteMany({
                where: {
                    chat_uuid: uuid
                }
            })
            await this.prisma.autenticacao.delete({ where: { uuid: user?.autenticacao_id } });
        }
    }

    /**
     * Busca um usuário pelo endereço de e-mail associado à autenticação.
     * @param email - Endereço de e-mail do usuário.
     * @returns Uma instância de UsuarioEntity ou null se não encontrado.
     */
    async findByEmail(email: string): Promise<UsuarioEntity | null> {
        const user = await this.prisma.usuario.findFirst({
            where: {
                autenticacao: {
                    email
                }
            },
            include: {
                autenticacao: true
            }
        });

        if (!user) {
            return null;
        }

        return user as unknown as UsuarioEntity;
    }
}