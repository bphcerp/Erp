import { userTypes } from "../schemas/Admin.ts";

export interface Permissions {
    allowed: string[];
    disallowed: string[];
}

export interface JwtPayload {
    email: string;
    userType: (typeof userTypes)[number];
    permissions: Permissions;
    sessionExpiry: number;
}

export interface AuthState {
    email: string;
    userType: (typeof userTypes)[number];
    roles: number[];
    isLoggedIn: boolean;
}

export interface EditProfileData {
    name?: string;
    phone?: string;
    description?: string;
    profileImage?: string;
    designation?: string;
    department?: string;
    education?: string[];
    researchInterests?: string[];
    courses?: string[];
    linkedin?: string;
    orchidID?: string;
    scopusID?: string;
    googleScholar?: string;
    additionalLinks?: string[];
}
