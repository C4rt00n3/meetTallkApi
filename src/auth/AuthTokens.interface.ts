import { UserEntity } from "src/user/entities/user.entity";

// Define uma interface para o tipo de retorno dos tokens
export default interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user: UserEntity;
}
