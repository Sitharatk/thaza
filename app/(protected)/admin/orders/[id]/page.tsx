import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { formatCurrency } from "@/src/lib/admin";
import { OrderStatusEditor } from "@/components/admin/OrderStatusEditor";

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  const supabase = await createSupabaseServerClient();
  const { data: order, error } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
  if (error) throw new Error("Could not load this order.");
  if (!order) notFound();
  return <div>
    <Link href="/admin/orders" className="text-sm font-bold text-[var(--green)]">← All orders</Link>
    <h1 className="serif mt-5 text-4xl">Order {order.order_number}</h1>
    <p className="mb-7 mt-2 text-sm text-slate-500">{new Date(order.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST · {order.payment_method}</p>
    <div className="mb-6 grid gap-5 sm:grid-cols-2">
      <section className="rounded-3xl border border-[var(--line)] bg-white p-6"><h2 className="text-lg font-bold">Customer</h2><p className="mt-4">{order.customer_name}</p><p className="mt-2">{order.phone}</p></section>
      <section className="rounded-3xl border border-[var(--line)] bg-white p-6"><h2 className="text-lg font-bold">Delivery address</h2><p className="mt-4 whitespace-pre-line">{order.address}</p>{order.landmark && <p>{order.landmark}</p>}<p>{order.city} — {order.pincode}</p></section>
    </div>
    <OrderStatusEditor orderId={order.id} currentStatus={order.status ?? "pending"} />
    <section className="mt-6 overflow-x-auto rounded-3xl border border-[var(--line)] bg-white p-6">
      <h2 className="mb-4 text-xl font-bold">Items</h2>
      <table className="w-full text-left text-sm"><thead><tr className="border-b border-[var(--line)]">{["Product", "Weight", "Price", "Quantity", "Total"].map((label) => <th key={label} className="py-3 pr-4">{label}</th>)}</tr></thead>
        <tbody>{(order.order_items as { id: string; product_name: string; weight: string; price: number; quantity: number; line_total: number }[]).map((item) => <tr key={item.id} className="border-b border-[var(--line)]"><td className="py-4 pr-4 font-bold">{item.product_name}</td><td className="pr-4">{item.weight}</td><td className="pr-4">{formatCurrency(Number(item.price))}</td><td className="pr-4">{item.quantity}</td><td>{formatCurrency(Number(item.line_total))}</td></tr>)}</tbody>
      </table>
      <dl className="ml-auto mt-6 max-w-xs space-y-3 text-sm">{[["Subtotal", order.subtotal], ["Delivery", order.delivery_charge], ["Grand total", order.grand_total]].map(([label, value]) => <div key={label} className="flex justify-between gap-6"><dt>{label}</dt><dd className="font-bold">{formatCurrency(Number(value))}</dd></div>)}</dl>
    </section>
  </div>;
}
