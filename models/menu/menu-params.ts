export type GetDishesParams = {
  limit?: number;
  skip?: number;
};

export type GetDishesByCategoryParams = {
  categoryName: string;
  limit?: number;
  skip?: number;
};
