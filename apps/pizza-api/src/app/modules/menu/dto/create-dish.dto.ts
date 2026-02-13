import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { DishErrors } from '@francesco-lucania-pizza-models';

export class CreateDishDto {
  @IsString({ message: DishErrors.NameMustBeString })
  @IsNotEmpty({ message: DishErrors.NameMustNotBeEmpty })
  public readonly name: string;

  @IsString({ message: DishErrors.FullNameMustBeString })
  @IsNotEmpty({ message: DishErrors.FullNameMustNotBeEmpty })
  public readonly fullName: string;

  @IsString({ message: DishErrors.DescriptionMustBeString })
  @IsNotEmpty({ message: DishErrors.DescriptionMustNotBeEmpty })
  public readonly description: string;

  @IsString({ message: DishErrors.IngredientsMustBeString })
  @IsNotEmpty({ message: DishErrors.IngredientsMustNotBeEmpty })
  public readonly ingredients: string;

  @IsString({ message: DishErrors.RecipeMustBeString })
  @IsNotEmpty({ message: DishErrors.RecipeMustNotBeEmpty })
  public readonly recipe: string;

  @Transform(({ value }) =>
    value === 'true' || value === true
      ? true
      : value === 'false' || value === false
      ? false
      : value,
  )
  @IsBoolean({ message: DishErrors.IsActiveMustBeBoolean })
  @IsOptional()
  public readonly isActive?: boolean;

  @IsString({ message: DishErrors.PictureMustBeString })
  @IsOptional()
  public readonly picture?: string;

  @IsArray({ message: DishErrors.ImagesMustBeArray })
  @IsString({ each: true, message: DishErrors.ImageItemMustBeString })
  @IsOptional()
  public readonly images?: string[];
}
