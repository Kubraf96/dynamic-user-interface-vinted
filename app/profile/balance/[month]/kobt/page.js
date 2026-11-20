import { notFound } from "next/navigation";
import ItemList from "@/components/economy/ItemList";
import { getMonth, getPurchases } from "@/lib/economy";

export async function generateMetadata({ params }) {
  const { month } = await params;
  return { title: `Købte varer · ${getMonth(month)?.label ?? ""}` };
}

export default async function BoughtItemsPage({ params }) {
  const { month: monthSlug } = await params;
  const month = getMonth(monthSlug);
  if (!month) notFound();

  return <ItemList type="kobt" month={month} items={getPurchases(monthSlug)} />;
}
