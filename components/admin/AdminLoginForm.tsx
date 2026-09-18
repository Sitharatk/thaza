"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      const { data: adminRecord, error: adminLookupError } = await supabase
        .from("admin_users")
        .select("id")
        .eq("email", email.trim())
        .maybeSingle();

      if (adminLookupError || !adminRecord) {
        await supabase.auth.signOut();
        throw new Error("This account does not have admin access.");
      }

      router.push("/admin");
      router.refresh();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Invalid email or password.";
      setError(message.includes("Invalid login") || message.includes("credentials") ? "Invalid email or password." : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--green)]">Thaza Admin</p>
        <h1 className="serif mt-3 text-3xl text-[var(--navy)]">Welcome back</h1>
      </div>

      <div className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-[var(--navy)]">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--cream)] px-4 py-3 text-sm text-[var(--navy)] outline-none transition focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--mint)]"
            placeholder="admin@thaza.in"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-[var(--navy)]">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--cream)] px-4 py-3 text-sm text-[var(--navy)] outline-none transition focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--mint)]"
            placeholder="••••••••"
            required
          />
        </label>
      </div>

      {error ? (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 flex w-full items-center justify-center rounded-full bg-[var(--navy)] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--green)] disabled:cursor-wait disabled:opacity-70"
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
