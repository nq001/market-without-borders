import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayload } from '../auth.service';

export const CurrentUser = createParamDecorator(
  (
    data: keyof TokenPayload | undefined,
    ctx: ExecutionContext,
  ): TokenPayload | string | string[] | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: TokenPayload }>();
    const user = request.user;
    if (!user) {
      return undefined;
    }
    if (data) {
      if (data === 'id') {
        return user.id ?? user.sub;
      }
      return user[data];
    }
    return user;
  },
);
