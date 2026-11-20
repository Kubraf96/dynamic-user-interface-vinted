import { getMonth, months } from "@/lib/economy";
import OverviewClient from "./OverviewClient";

export const metadata = {
  title: "Mit overblik",
};

export default async function OverviewPage({ searchParams }) {
  const { month } = await searchParams;
  const initialMonth = getMonth(month)?.slug ?? months[0].slug;

  return <OverviewClient initialMonth={initialMonth} />;
}
