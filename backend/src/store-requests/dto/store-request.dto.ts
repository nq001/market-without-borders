import { IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateStoreEditRequestDto {
  @IsNotEmpty()
  @IsUUID()
  store_id: string;

  @IsNotEmpty()
  @IsObject()
  requested_changes: Record<string, any>;
}

export class ReviewStoreEditRequestDto {
  @IsNotEmpty()
  @IsString()
  status: 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  rejection_reason?: string;
}

