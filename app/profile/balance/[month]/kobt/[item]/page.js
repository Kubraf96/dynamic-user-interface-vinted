import { notFound } from "next/navigation";
import ItemDetail from "@/components/economy/ItemDetail";
import { getPurchase } from "@/lib/economy";

export const metadata = {
  title: "Købsdetalje",
};

export default async function PurchaseDetailPage({ params }) {
  const { month, item: itemId } = await params;
  const item = getPurchase(month, itemId);
  if (!item) notFound();

  return <ItemDetail type="kobt" item={item} />;
}
