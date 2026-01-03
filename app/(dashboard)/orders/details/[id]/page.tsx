import OrderDetails from "@/components/order-details";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  // `OrderDetails` is a client component and will read the token from localStorage if none is provided.
  return <OrderDetails orderId={id} />;
}
