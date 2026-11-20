import { notFound } from "next/navigation";
import ItemList from "@/components/economy/ItemList";
import { getMonth, getSales } from "@/lib/economy";

export async function generateMetadata({ params }) {
  const { month } = await params;
  return { title: `Solgte varer · ${getMonth(month)?.label ?? ""}` };
}

export default async function SoldItemsPage({ params }) {
  const { month: monthSlug } = await params;
  const month = getMonth(monthSlug);
  if (!month) notFound();

  return <ItemList type="solgt" month={month} items={getSales(monthSlug)} />;
}
