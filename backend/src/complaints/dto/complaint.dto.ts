import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateComplaintDto {
  @IsNotEmpty()
  @IsUUID()
  store_id: string;

  @IsOptional()
  @IsUUID()
  order_id?: string;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsNotEmpty()
  @IsString()
  details: string;
}

export class ResolveComplaintDto {
  @IsNotEmpty()
  @IsString()
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';

  @IsOptional()
  @IsString()
  admin_action?: 'NONE' | 'STORE_SUSPENDED' | 'WARNING_ISSUED';

  @IsOptional()
  @IsString()
  admin_notes?: string;
}

