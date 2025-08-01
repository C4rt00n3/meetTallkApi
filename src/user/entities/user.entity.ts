import { $Enums, Auth, Location, Preference, PrivacyUser } from "@prisma/client";
import { Entity } from "typeorm";

@Entity()
export class UserEntity {
    name: string;
    uuid: string;
    gender: $Enums.Gender | null;
    birthDate: Date;
    locationId: string | null;
    authId: string;
    createAt: Date;
    updateAt?: Date;
    preferenceUuid: string | null;
    auth: Auth;
    location?: Location;
    preference: Preference;
    provider: $Enums.Provider
    privacyUser?: PrivacyUser
}
