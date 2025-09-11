import { User } from "../../../user/domain/entities/user.entity";

export interface AuthUser extends User {
  emailVerified: boolean;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface AuthResponse {
  user: AuthUser;
  session: AuthSession | null;
}

export interface Token {
  accessToken: string;
  refreshToken: string;
}

export interface UserWithToken {
  user: User;
  token: Token;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ResetPasswordConfirmRequest {
  token: string;
  password: string;
}

export interface ResetPasswordConfirmResponse {
  message: string;
}
