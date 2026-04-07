import { DishDetails } from '../../components/DishDetails/DishDetails';

type DishPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DishPage({ params }: DishPageProps) {
  const { id } = await params;

  return <DishDetails dishId={id} />;
}
