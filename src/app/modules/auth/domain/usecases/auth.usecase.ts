import { UserWithToken } from "../entities/auth.entity";
import { AuthRepository } from "../repositories/auth.repository";

interface AuthResponse {
  authInfos: UserWithToken | null;
}

export class LoginUsecase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(
    email: string,
    password: string
  ): Promise<AuthResponse | { error: string }> {
    const authInfos = await this.authRepository.login({ email, password });

    if ("error" in authInfos) {
      // Retourne un objet contenant l'erreur
      return { error: authInfos.error };
    }

    // Retourne les informations d'authentification
    return { authInfos };
  }
}

export class ForgotPasswordUsecase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(email: string): Promise<boolean> {
    return this.authRepository.forgotPassword(email);
  }
}

export class ValidateResetTokenUsecase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(token: string): Promise<boolean> {
    return this.authRepository.validateResetToken(token);
  }
}

export class ResetPasswordUsecase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(token: string, password: string): Promise<boolean> {
    return this.authRepository.resetPassword(token, password);
  }
}
