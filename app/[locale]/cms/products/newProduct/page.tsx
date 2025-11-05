import { NewProductForm } from './NewProductForm';
import { requireAdmin } from '@/services/auth/auth.helpers';

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdmin(locale);

  return <NewProductForm />;
}
