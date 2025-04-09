import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ServerConfig } from 'src/core/config';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    type: Number,
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  page: number;

  @ApiPropertyOptional({
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  lastItemId?: number;

  @ApiProperty({
    type: Number,
    example: 20,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(ServerConfig.get().PAGE_SIZE_MAX)
  pageSize: number;
}

export class PaginationMetadataResponseDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  total: number;
}

export class PaginationResponseDto<T> {
  @ApiProperty()
  data: T[];

  @ApiProperty({
    type: PaginationMetadataResponseDto,
  })
  pagination: PaginationMetadataResponseDto;
}
