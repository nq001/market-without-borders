import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export interface IDomainException {
  readonly code: string;
  readonly message: string;
}

export class DomainException extends Error implements IDomainException {
  public readonly code: string;

  constructor(message: string, code = 'DOMAIN_ERROR') {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }
}

export class BusinessRuleViolationException
  extends BadRequestException
  implements IDomainException
{
  public readonly code: string;

  constructor(message: string, code = 'BUSINESS_RULE_VIOLATION') {
    super(message);
    this.code = code;
  }
}

export class EntityNotFoundDomainException
  extends NotFoundException
  implements IDomainException
{
  public readonly code: string;

  constructor(message: string, code = 'ENTITY_NOT_FOUND') {
    super(message);
    this.code = code;
  }
}

export class ConflictDomainException
  extends ConflictException
  implements IDomainException
{
  public readonly code: string;

  constructor(message: string, code = 'DOMAIN_CONFLICT') {
    super(message);
    this.code = code;
  }
}

export class UnauthorizedDomainException
  extends UnauthorizedException
  implements IDomainException
{
  public readonly code: string;

  constructor(message: string, code = 'UNAUTHORIZED_DOMAIN_ACTION') {
    super(message);
    this.code = code;
  }
}

export class ForbiddenDomainException
  extends ForbiddenException
  implements IDomainException
{
  public readonly code: string;

  constructor(message: string, code = 'FORBIDDEN_DOMAIN_ACTION') {
    super(message);
    this.code = code;
  }
}

export function isUniqueConstraintError(error: unknown): boolean {
  const err = error as {
    code?: string;
    driverError?: { code?: string };
    message?: string;
  };
  return Boolean(
    err?.code === '23505' ||
    err?.driverError?.code === '23505' ||
    (typeof err?.message === 'string' &&
      (err.message.toLowerCase().includes('unique') ||
        err.message.toLowerCase().includes('duplicate key'))),
  );
}
