import { notFound } from "next/navigation";
import ItemDetail from "@/components/economy/ItemDetail";
import { getSale } from "@/lib/economy";

export const metadata = {
  title: "Salgsdetalje",
};

export default async function SaleDetailPage({ params }) {
  const { month, item: itemId } = await params;
  const item = getSale(month, itemId);
  if (!item) notFound();

  return <ItemDetail type="solgt" item={item} />;
}
