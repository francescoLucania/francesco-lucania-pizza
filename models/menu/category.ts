export type Category = {
  _id: string;
  name: string;
  description: string;
  list: string[];
};

export type CreateCategoryDto = {
  name: string;
  description: string;
  list?: string[];
};

export type UpdateCategoryDto = {
  name?: string;
  description?: string;
  list?: string[];
};
