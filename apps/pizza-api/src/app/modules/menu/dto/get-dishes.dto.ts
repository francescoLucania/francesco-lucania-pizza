import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetDishesDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'LIMIT_MUST_BE_NUMBER' })
  @Min(1, { message: 'LIMIT_MUST_BE_POSITIVE' })
  public readonly limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'SKIP_MUST_BE_NUMBER' })
  @Min(0, { message: 'SKIP_MUST_BE_NON_NEGATIVE' })
  public readonly skip?: number;
}
