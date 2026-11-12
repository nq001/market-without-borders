import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateStoreDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsUUID()
  owner_id: string;

  @IsOptional()
  @IsString()
  banner_url?: string;
}

export class UpdateStoreDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  banner_url?: string;

  @IsOptional()
  @IsString()
  status?: 'ACTIVE' | 'SUSPENDED';

  @IsOptional()
  @IsUUID()
  owner_id?: string;
}

