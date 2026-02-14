import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'NAME_MUST_BE_STRING' })
  @IsNotEmpty({ message: 'NAME_MUST_NOT_BE_EMPTY' })
  public readonly name: string;

  @IsString({ message: 'DESCRIPTION_MUST_BE_STRING' })
  @IsNotEmpty({ message: 'DESCRIPTION_MUST_NOT_BE_EMPTY' })
  public readonly description: string;

  @IsArray({ message: 'LIST_MUST_BE_ARRAY' })
  @IsOptional()
  public readonly list?: string[];
}
