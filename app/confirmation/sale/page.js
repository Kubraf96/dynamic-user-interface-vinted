import OrderConfirmation from "@/components/OrderConfirmation";

export const metadata = {
  title: "Salgsbekræftelse",
};

export default function SaleConfirmationPage() {
  return <OrderConfirmation type="sale" />;
}
