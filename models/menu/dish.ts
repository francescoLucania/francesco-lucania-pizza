export enum DishErrors {
  NameMustNotBeEmpty = 'NAME_MUST_NOT_BE_EMPTY',
  FullNameMustNotBeEmpty = 'FULL_NAME_MUST_NOT_BE_EMPTY',
  DescriptionMustNotBeEmpty = 'DESCRIPTION_MUST_NOT_BE_EMPTY',
  IngredientsMustNotBeEmpty = 'INGREDIENTS_MUST_NOT_BE_EMPTY',
  RecipeMustNotBeEmpty = 'RECIPE_MUST_NOT_BE_EMPTY',
  NameMustBeString = 'NAME_MUST_BE_STRING',
  FullNameMustBeString = 'FULL_NAME_MUST_BE_STRING',
  DescriptionMustBeString = 'DESCRIPTION_MUST_BE_STRING',
  IngredientsMustBeString = 'INGREDIENTS_MUST_BE_STRING',
  RecipeMustBeString = 'RECIPE_MUST_BE_STRING',
  PictureMustBeString = 'PICTURE_MUST_BE_STRING',
  IsActiveMustBeBoolean = 'IS_ACTIVE_MUST_BE_BOOLEAN',
  ImagesMustBeArray = 'IMAGES_MUST_BE_ARRAY',
  ImageItemMustBeString = 'IMAGE_ITEM_MUST_BE_STRING',
}

export type Dish = {
  _id: string;
  name: string;
  fullName: string;
  description?: string;
  ingredients?: string;
  recipe?: string;
  created?: string;
  isActive?: boolean;
  picture?: string;
  images?: string[];
};

export type CreateDishDto = {
  name: string;
  fullName: string;
  description: string;
  ingredients: string;
  recipe: string;
  isActive: boolean;
};

export type DishesResponse = {
  dishes: Dish[];
  total: number;
};
