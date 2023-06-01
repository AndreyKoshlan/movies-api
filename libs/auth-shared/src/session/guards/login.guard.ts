import { ApiBody } from "@nestjs/swagger";
import { applyDecorators, CanActivate, ExecutionContext, Injectable, UseGuards } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AuthCredentialsDto } from "@app/auth-shared/session/dto/auth-credentials.dto";
import { UserSharedService } from "@app/auth-shared/user/user-shared.service";
import {
  CredentialsAuthenticatedRequest
} from "@app/auth-shared/session/interfaces/credentials-authenticated-request.interface";

export function LoginGuard() {
  @Injectable()
  class LoginGuardMixin implements CanActivate {
    constructor(
      public readonly userSharedService: UserSharedService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<CredentialsAuthenticatedRequest>();

      // Получаем email и пароль из запроса
      const authCredentials: AuthCredentialsDto = request.body;

      const user = await this.userSharedService.findByEmail(authCredentials.email);

      if (!user)
        return false;

      const passwordEquals = await bcrypt.compare(
        authCredentials.password,
        user.passwordHash
      );

      if (!passwordEquals)
        return false;

      request.user = user;

      return true;
    }
  }

  return applyDecorators(
    UseGuards(LoginGuard),
    ApiBody({ type: AuthCredentialsDto, description: 'Данные авторизации' })
  );
}