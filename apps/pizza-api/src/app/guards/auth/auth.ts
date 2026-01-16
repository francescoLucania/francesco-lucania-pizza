import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import UnauthorizedException from '../../exception/unauthorized/unauthorized';
import { TokenService } from '../../user/services/token/token.service';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private tokenService: TokenService) {}
  canActivate(context: ExecutionContext): boolean {
    const response = context.switchToHttp().getRequest();
    const token = response?.headers['authorization']?.split(' ')?.[1];

    if (token && this.tokenService.validateToken('ACCESS_TOKEN', token)) {
      return true;
    }

    throw new UnauthorizedException(
      token ? 'NOT_VALID_TOKEN' : 'TOKEN_MISSING'
    );
  }
}
