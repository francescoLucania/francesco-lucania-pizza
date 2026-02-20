import { IsOptional, IsNumber, Min, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class GetDishesByCategoryDto {
  @IsNotEmpty({ message: 'CATEGORY_NAME_REQUIRED' })
  @IsString({ message: 'CATEGORY_NAME_MUST_BE_STRING' })
  public readonly categoryName: string;

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
