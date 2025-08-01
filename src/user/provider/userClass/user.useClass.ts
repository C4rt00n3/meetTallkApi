import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { CreatePrivacyUserDto, CreateUserDto, FindUserParams, GenericFilter, UpdateUserDto } from "src/user/dto/user.dto";
import { UserEntity } from "src/user/entities/user.entity";
import { UserProvider } from "../user.provider";
import { ChatGateway } from "src/gateway/chat.gateway";
import { PrismaService } from "src/prisma.service";


@Injectable()
export default class UserClass implements UserProvider {
    /**
     * Classe responsável por gerenciar operações CRUD no modelo Usuario utilizando o PrismaService.
     */
    constructor(
        private readonly prisma: PrismaService,
        private readonly chatGetawy: ChatGateway
    ) { }

    async onModuleInit() {
        console.log('Inicializando middleware do Prisma para User...');
        this.observerUsres();
    }

    async observerUsres() {
        this.prisma.$use(async (params, next) => {
            if (params.model === 'User' && (params.action === 'update' || params.action === 'create' || params.action === 'delete')) {
                this.chatGetawy.notifyContactsOfUserUpdate(params.args.where?.uuid, params.action, params.args.data)
            }
            const result = await next(params)
            return result
        })
    }

    /**
     * Busca um usuário que corresponda aos critérios fornecidos.
     * @param params - Parâmetros de busca definidos na interface FindUsariosParams.
     * @returns Retorna o primeiro usuário encontrado ou null se não houver correspondência.
     */
    async find(params: FindUserParams): Promise<User | null> {
        return await this.prisma.user.findFirst({
            where: { ...params },
            include: {
                profileImages: {
                    select: {
                        uuid: true
                    }
                },
                preference: true
            }
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
    async findMany({ name }: FindUserParams, userParma: User, filter: GenericFilter): Promise<User[]> {
        const user = userParma as unknown as UserEntity;

        const users = await this.prisma.user.findMany({
            where: {
                name: { contains: (name || "").trim() },
            },
            skip: (filter.page - 1) * (filter.pageSize + 1),
            take: filter.pageSize,
            include: {
                location: true,
                profileImages: {
                    select: {
                        uuid: true
                    }
                },
                preference: true,
                privacyUser: true
            }
        });

        return users
            .map(userInMap => ({
                ...userInMap,
                distancia: this.calcularDistancia(
                    parseFloat(user.location?.latitude || "0"),
                    parseFloat(user.location?.longitude || "0"),
                    parseFloat(userInMap.location?.latitude || "0"),
                    parseFloat(userInMap.location?.longitude || "0")
                )
            }))
            .sort((a, b) => a.distancia - b.distancia);
    }

    /**
 * Cria um novo usuário com base nos dados fornecidos.
 * 
 * - Cria os dados principais do usuário (nome, email, etc.).
 * - Cria os dados de autenticação relacionados.
 * - Cria os dados de localização, se latitude e longitude forem válidos.
 *
 * @param body - Objeto contendo os dados do usuário, autenticação e localização.
 *   @property auth - Dados de autenticação do usuário (e.g., email e senha).
 *   @property location - (Opcional) Objeto com latitude e longitude do usuário.
 *   @property ...body - Demais campos esperados pelo modelo User (ex: nome, idade).
 * 
 * @returns Retorna o usuário criado, incluindo dados de localização e imagens de perfil (se existirem).
 */
    async create({
        auth,
        location,
        preference,
        privacyUser,
        ...body
    }: CreateUserDto): Promise<User> {
        const user = await this.findByEmail(auth.email)
        const privacy = new CreatePrivacyUserDto()

        if (user)
            throw new BadRequestException("Usuário já existe. faça login")
        return await this.prisma.user.create({
            data: {
                ...body,
                auth: { create: { ...auth } },
                privacyUser: privacyUser ? {
                    create: {
                        ...privacyUser
                    }
                } : {
                    create: {
                        ...privacy
                    }
                },
                location: location?.longitude && location?.latitude
                    ? { create: location }
                    : undefined,
                preference: {
                    create: {
                        gender: preference?.gender || "O",
                        maxAge: preference?.maxAge || 100
                    }
                } 
            },
            include: {
                location: true,
                profileImages: true,
                preference: true,
                privacyUser: true
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
        { auth, location, preference, privacyUser, ...data }: UpdateUserDto, // 'data' contém name, age, gender
        uuid: string
    ): Promise<User | null> {
        const user = await this.findUnique(uuid);

        if (!user) {
            throw new NotFoundException("Usuário não encontrado!");
        }
        if (data.name === undefined) delete data.name;
        if (data.birthDate === undefined) delete data.birthDate;
        if (data.gender === undefined) delete data.gender;

        return await this.prisma.user.update({
            where: { uuid },
            data: {
                ...data,
                privacyUser: privacyUser ? {
                    upsert: {
                        create: {
                            ...privacyUser
                        },
                        update: {
                            ...privacyUser
                        }
                    }
                } : undefined,
                preference: preference ? {
                    upsert: {
                        create: {
                            gender: preference.gender,
                            maxAge: preference.maxAge
                        },
                        update: {
                            gender: preference.gender,
                            maxAge: preference.maxAge
                        }
                    }
                } : undefined,

                location: location?.longitude != null && location?.latitude != null
                    ? {
                        upsert: {
                            create: {
                                latitude: location.latitude,
                                longitude: location.longitude,
                                state: location.state,
                                city: location.city,
                                country: location.country
                            },
                            update: {
                                latitude: location.latitude,
                                longitude: location.longitude,
                                state: location.state,
                                city: location.city,
                                country: location.country
                            }
                        }
                    }
                    : undefined
            },
            include: {
                location: true,
                preference: true,
                privacyUser: true
            }
        });
    }

    /**
     * Busca um usuário pelo UUID.
     * @param uuid - Identificador único do usuário.
     * @returns O usuário encontrado ou lança uma exceção se não encontrado.
     * @throws NotFoundException - Se o usuário não for encontrado pelo UUID.
     */
    async findUnique(uuid: string): Promise<User | null> {
        try {
            return await this.prisma.user.findUniqueOrThrow({
                where: { uuid },
                include: {
                    location: true,
                    profileImages: {
                        select: {
                            uuid: true
                        }
                    },
                    preference: true,
                    privacyUser: true
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

        await this.prisma.user.delete({ where: { uuid } });

        if (user) {
            await this.prisma.chatParticipant.deleteMany({
                where: {
                    chatId: uuid
                }
            })
            await this.prisma.auth.delete({ where: { uuid: user?.authId } });
        }
    }

    /**
     * Busca um usuário pelo endereço de e-mail associado à autenticação.
     * @param email - Endereço de e-mail do usuário.
     * @returns Uma instância de UsuarioEntity ou null se não encontrado.
     */
    async findByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findFirst({
            where: {
                auth: {
                    email
                }
            },
            include: {
                auth: true,
                profileImages: {
                    select: {
                        uuid: true
                    }
                },
                preference: true,
                privacyUser: true
            }
        });

        if (!user) {
            return null;
        }

        return user;
    }
    
   
    /**
     * Busca um usuário aleatório no banco de dados, aplicando filtros de preferência se fornecidos.
     * Garante que o usuário retornado não seja o mesmo que fez a requisição,
     * nem qualquer outro UUID fornecido na lista de exclusão.
     *
     * @param {object} params - Objeto contendo as preferências do usuário logado, seu próprio UUID, e uma lista de UUIDs a serem excluídos.
     * @param {PreferenceDto} params.preference - As preferências do usuário.
     * @param {string} params.uuid - O UUID do usuário que está logado, para excluí-lo da busca.
     * @param {string[]} [params.excludeUuids] - Uma lista opcional de UUIDs adicionais a serem excluídos da busca.
     * @returns {Promise<User | null>} Um usuário aleatório que corresponde às preferências e não está nas listas de exclusão, ou `null` se nenhum for encontrado.
     */
    async randomUser(currentUser: UserEntity): Promise<User | null> {
        try {
            // Primeiro, busca o usuário completo com suas preferências
            const userWithPreference = await this.prisma.user.findUnique({
                where: { uuid: currentUser.uuid },
                include: {
                    preference: true
                }
            });

            if (!userWithPreference || !userWithPreference.preference) {
                // Se o usuário ou suas preferências não forem encontradas, não é possível filtrar
                return null;
            }

            const preference = userWithPreference.preference;
            const uuid = userWithPreference.uuid;
            const conditions: Array<Prisma.Sql> = [];

            // Adiciona o UUID do usuário logado à lista de exclusão
            const allUuidsToExclude = new Set<string>();
            if (uuid) {
                allUuidsToExclude.add(uuid);
            }
            
            // Busca e adiciona os usuários bloqueados à lista de exclusão
            const blockedUsers = await this.prisma.block.findMany({
                where: {
                    userId: uuid
                },
                select: {
                    blockedUser: {
                        select: {
                            uuid: true
                        }
                    }
                }
            });
            if (blockedUsers && blockedUsers.length > 0) {
                blockedUsers.forEach(block => allUuidsToExclude.add(block.blockedUser.uuid));
            }

            // Se houver UUIDs para excluir, adicione a condição NOT IN
            if (allUuidsToExclude.size > 0) {
                const uuidsSql = Array.from(allUuidsToExclude).map(id => Prisma.sql`${id}`);
                conditions.push(Prisma.sql`\`uuid\` NOT IN (${Prisma.join(uuidsSql)})`);
            }

            if (preference) {
                // Modificado para ignorar o filtro de gênero se a preferência for 'O'
                if (preference.gender && preference.gender !== 'O') {
                    conditions.push(Prisma.sql`\`sexo\` = ${preference.gender}`);
                }
                
                // Calcula a idade a partir da data de nascimento ("birthDate") para filtrar
                // A função `TIMESTAMPDIFF` do MySQL é mais precisa para calcular a idade
                const ageCalculationSql = Prisma.sql`TIMESTAMPDIFF(YEAR, \`birthDate\`, CURDATE())`;

                if (preference.maxAge) {
                    conditions.push(Prisma.sql`${ageCalculationSql} <= ${preference.maxAge}`);
                }
                
                // Garante que a idade mínima seja 18
                conditions.push(Prisma.sql`${ageCalculationSql} >= 17`);
            }

            // Constrói a consulta para buscar um único UUID aleatório
            const queryParts: Array<string | Prisma.Sql> = [Prisma.sql`SELECT \`uuid\` FROM \`usuario\``];
            if (conditions.length > 0) {
                queryParts.push(Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`);
            }
            // Corrigido para usar a função de ordenação aleatória RAND() do MySQL
            queryParts.push(Prisma.sql`ORDER BY RAND() LIMIT 1`);
            const finalQuery = Prisma.join(queryParts, ' ');

            // Executa a consulta para obter o UUID aleatório
            const randomUuidResult = await this.prisma.$queryRaw<{ uuid: string }[]>(finalQuery);

            // Se nenhum UUID for encontrado, retorna null
            if (randomUuidResult.length === 0) {
                return null;
            }
            const randomUuid = randomUuidResult[0].uuid;

            // Busca o usuário completo usando o UUID e inclui todas as relações necessárias
            return await this.prisma.user.findUnique({
                where: { uuid: randomUuid },
                include: {
                    location: true,
                    preference: true,
                    privacyUser: true,
                    profileImages: {
                        select: {
                            uuid: true,
                            slot: true
                        }
                        
                    },
                }
            });
        } catch (error) {
            console.error("Erro ao buscar usuário aleatório com preferências:", error);
            throw error;
        }
    }
}