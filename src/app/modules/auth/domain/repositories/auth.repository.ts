import { AuthCredentials, UserWithToken } from "../entities/auth.entity";

export interface AuthRepository {
  login(
    credentials: AuthCredentials
  ): Promise<UserWithToken | { error: string }>;
  forgotPassword(email: string): Promise<boolean>;
  validateResetToken(token: string): Promise<boolean>;
  resetPassword(token: string, password: string): Promise<boolean>;
}
