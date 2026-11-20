import OrderConfirmation from "@/components/OrderConfirmation";

export const metadata = {
  title: "Købsbekræftelse",
};

export default function PurchaseConfirmationPage() {
  return <OrderConfirmation type="purchase" />;
}
