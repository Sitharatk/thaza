import Link from "next/link";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { formatCurrency, getStatusMeta } from "@/src/lib/admin";

async function getDashboardStats() {
  const supabase = await createSupabaseServerClient();
  const indiaDate = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const startOfToday = new Date(`${indiaDate}T00:00:00+05:30`).toISOString();

  const [ordersToday, pendingOrders, preparingOrders, outForDeliveryOrders, deliveredOrders, todayRevenue] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", startOfToday),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "preparing"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "out_for_delivery"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "delivered"),
    supabase.from("orders").select("grand_total").gte("created_at", startOfToday),
  ]);

  if ([ordersToday, pendingOrders, preparingOrders, outForDeliveryOrders, deliveredOrders, todayRevenue].some((result) => result.error)) {
    throw new Error("Dashboard order queries failed.");
  }

  const revenue = (todayRevenue.data ?? []).reduce((sum, record) => sum + Number(record.grand_total || 0), 0);

  return {
    ordersToday: ordersToday.count ?? 0,
    pending: pendingOrders.count ?? 0,
    preparing: preparingOrders.count ?? 0,
    outForDelivery: outForDeliveryOrders.count ?? 0,
    delivered: deliveredOrders.count ?? 0,
    revenue,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  const cards = [
    { title: "Orders Today", value: String(stats.ordersToday), accent: "bg-[var(--navy)] text-white" },
    { title: "Pending Orders", value: String(stats.pending), accent: "bg-amber-100 text-amber-900" },
    { title: "Preparing Orders", value: String(stats.preparing), accent: "bg-orange-100 text-orange-900" },
    { title: "Out for Delivery", value: String(stats.outForDelivery), accent: "bg-violet-100 text-violet-900" },
    { title: "Delivered Orders", value: String(stats.delivered), accent: "bg-emerald-100 text-emerald-900" },
    { title: "Today's Revenue", value: formatCurrency(stats.revenue), accent: "bg-[var(--mint)] text-[var(--navy)]" },
  ];

  const { data: recentOrders, error } = await createSupabaseServerClient().then((supabase) =>
    supabase
      .from("orders")
      .select("id, order_number, customer_name, phone, grand_total, payment_method, status, created_at")
      .order("created_at", { ascending: false })
      .limit(6)
  );
  if (error) throw new Error("Recent orders could not be loaded.");

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-3 rounded-[28px] bg-gradient-to-r from-[var(--navy)] to-[#234d63] p-7 text-white shadow-xl shadow-slate-900/10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Overview</p>
          <h1 className="serif mt-2 text-4xl">Admin dashboard</h1>
          <p className="mt-2 text-sm text-white/70">Keep today&apos;s orders moving and your catalogue fresh.</p>
        </div>
        <Link href="/admin/products" className="hidden rounded-full bg-white/10 px-5 py-3 text-sm font-bold ring-1 ring-white/20 transition hover:bg-white/20 sm:block">Manage products →</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.title} className={`rounded-[26px] p-5 shadow-[0_12px_30px_rgba(21,55,76,0.07)] ${card.accent}`}>
            <p className="text-sm font-semibold opacity-80">{card.title}</p>
            <p className="mt-4 text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-3xl border border-[var(--line)] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[var(--navy)]">Recent Orders</h2>
          </div>
          <Link href="/admin/orders" className="text-sm font-bold text-[var(--green)]">View all</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-slate-500">
                <th className="py-3 pr-4 font-semibold">Order ID</th>
                <th className="py-3 pr-4 font-semibold">Customer</th>
                <th className="py-3 pr-4 font-semibold">Phone</th>
                <th className="py-3 pr-4 font-semibold">Amount</th>
                <th className="py-3 pr-4 font-semibold">Payment</th>
                <th className="py-3 pr-4 font-semibold">Status</th>
                <th className="py-3 pr-4 font-semibold">Date</th>
                <th className="py-3 font-semibold">View</th>
              </tr>
            </thead>
            <tbody>
              {!recentOrders?.length && <tr><td colSpan={8} className="py-10 text-center text-slate-500">No orders are visible yet. If an order has already been placed, check that admin order access has been enabled in Supabase.</td></tr>}
              {(recentOrders ?? []).map((order) => (
                <tr key={order.id} className="border-b border-[var(--line)] last:border-b-0">
                  <td className="py-3 pr-4 font-bold text-[var(--navy)]">{order.order_number}</td>
                  <td className="py-3 pr-4">{order.customer_name}</td>
                  <td className="py-3 pr-4">{order.phone}</td>
                  <td className="py-3 pr-4">{formatCurrency(Number(order.grand_total))}</td>
                  <td className="py-3 pr-4">{order.payment_method}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${getStatusMeta(order.status).className}`}>
                      {getStatusMeta(order.status).label}
                    </span>
                  </td>
                  <td className="py-3 pr-4">{new Date(order.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td className="py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-bold text-[var(--green)]">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
