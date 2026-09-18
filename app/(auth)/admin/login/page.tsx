import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export default async function AdminLoginPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.email) {
    const { data: adminRecord } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", user.email)
      .maybeSingle();

    if (adminRecord) {
      redirect("/admin");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--cream)] px-4 py-10">
      <div className="w-full max-w-lg rounded-[32px] border border-[var(--line)] bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green)]">Thaza Admin</p>
          <h1 className="serif mt-3 text-4xl text-[var(--navy)]">Order dashboard</h1>
        </div>
        <AdminLoginForm />
      </div>
    </main>
  );
}
