import { Auth, Location, Preference, User } from "@prisma/client";

export interface UserEntity extends User {
    auth: Auth;
    location?: Location,
    preference: Preference
}
