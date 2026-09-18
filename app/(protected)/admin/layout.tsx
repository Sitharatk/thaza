import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

async function logoutAction() {
  "use server";
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("id")
    .eq("email", user.email)
    .maybeSingle();

  if (!adminUser) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--navy)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-[var(--line)] bg-white lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col p-5">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--green)]/10 text-lg font-bold text-[var(--green)]">T</div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--green)]">Thaza</p>
                <p className="text-sm font-bold">Admin</p>
              </div>
            </div>

            <nav className="flex flex-1 flex-col gap-2">
              <Link href="/admin" className="rounded-xl px-3 py-2.5 text-sm font-bold text-[var(--navy)] transition hover:bg-[var(--mint)]">Dashboard</Link>
              <Link href="/admin/orders" className="rounded-xl px-3 py-2.5 text-sm font-bold text-[var(--navy)] transition hover:bg-[var(--mint)]">Orders</Link>
              <Link href="/admin/products" className="rounded-xl px-3 py-2.5 text-sm font-bold text-[var(--navy)] transition hover:bg-[var(--mint)]">Products</Link>
              <form action={logoutAction} className="mt-auto">
                <button type="submit" className="w-full rounded-xl bg-[var(--navy)] px-3 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--green)]">
                  Logout
                </button>
              </form>
            </nav>
          </div>
        </aside>

        <main className="flex-1 bg-[radial-gradient(circle_at_top_right,_rgba(185,235,204,0.24),_transparent_30%)] p-4 sm:p-6 lg:p-10"><div className="mx-auto max-w-6xl">{children}</div></main>
      </div>
    </div>
  );
}
