import Link from "next/link";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { formatCurrency, getStatusMeta } from "@/src/lib/admin";

const STATUS_OPTIONS = ["all", "pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const query = (params.q ?? "").trim();
  const status = (params.status ?? "all").toString();
  const requestedPage = Number(params.page ?? "1");
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageSize = 10;

  const supabase = await createSupabaseServerClient();
  let ordersQuery = supabase
    .from("orders")
    .select("id, order_number, customer_name, phone, grand_total, payment_method, status, created_at", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status !== "all") {
    ordersQuery = ordersQuery.eq("status", status);
  }

  if (query) {
    const q = `%${query}%`;
    ordersQuery = ordersQuery.or(`order_number.ilike."${q}",customer_name.ilike."${q}",phone.ilike."${q}"`);
  }

  const { data: orders, count, error } = await ordersQuery.range((page - 1) * pageSize, page * pageSize - 1);

  if (error) throw new Error("Orders could not be loaded.");

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--green)]">Orders</p>
          <h1 className="serif mt-2 text-4xl text-[var(--navy)]">Order management</h1>
        </div>
      </div>

      <div className="rounded-3xl border border-[var(--line)] bg-white p-4 shadow-sm sm:p-5">
        <form className="flex flex-col gap-3 lg:flex-row lg:items-center" method="GET">
          <div className="flex-1">
            <input
              aria-label="Search orders"
              name="q"
              defaultValue={query}
              placeholder="Search order ID, customer or phone"
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--cream)] px-4 py-3 text-sm text-[var(--navy)] outline-none focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--mint)]"
            />
          </div>

          <div className="lg:w-56">
            <select
              aria-label="Filter by order status"
              name="status"
              defaultValue={status}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--cream)] px-4 py-3 text-sm text-[var(--navy)] outline-none focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--mint)]"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All" : getStatusMeta(option).label}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-bold text-white">Apply filters</button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => {
            const active = status === option;
            const label = option === "all" ? "All" : getStatusMeta(option).label;

            return (
              <a
                key={option}
                href={`/admin/orders?status=${option}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${active ? "bg-[var(--navy)] text-white" : "bg-[var(--cream)] text-[var(--navy)] ring-1 ring-[var(--line)]"}`}
              >
                {label}
              </a>
            );
          })}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-[var(--line)] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--cream)] text-slate-500">
                <th className="px-4 py-3 font-semibold">Order ID</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">View</th>
              </tr>
            </thead>
            <tbody>
              {(orders ?? []).length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">No orders found.</td>
                </tr>
              ) : (
                (orders ?? []).map((order) => (
                  <tr key={order.id} className="border-b border-[var(--line)] last:border-b-0">
                    <td className="px-4 py-3 font-bold text-[var(--navy)]">{order.order_number}</td>
                    <td className="px-4 py-3">{order.customer_name}</td>
                    <td className="px-4 py-3">{order.phone}</td>
                    <td className="px-4 py-3">{formatCurrency(Number(order.grand_total))}</td>
                    <td className="px-4 py-3">{order.payment_method}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${getStatusMeta(order.status).className}`}>
                        {getStatusMeta(order.status).label}
                      </span>
                    </td>
                    <td className="px-4 py-3">{new Date(order.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="font-bold text-[var(--green)]">View</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <a
            href={`/admin/orders?page=${Math.max(1, page - 1)}${status !== "all" ? `&status=${status}` : ""}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
            className={`rounded-full px-3 py-2 text-sm font-bold ${page <= 1 ? "pointer-events-none bg-slate-100 text-slate-400" : "bg-[var(--navy)] text-white"}`}
          >
            Prev
          </a>
          <a
            href={`/admin/orders?page=${Math.min(totalPages, page + 1)}${status !== "all" ? `&status=${status}` : ""}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
            className={`rounded-full px-3 py-2 text-sm font-bold ${page >= totalPages ? "pointer-events-none bg-slate-100 text-slate-400" : "bg-[var(--navy)] text-white"}`}
          >
            Next
          </a>
        </div>
      </div>

    </div>
  );
}
