"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return <div role="alert" className="rounded-3xl border border-red-200 bg-white p-8">
    <h1 className="serif text-3xl">Could not load this admin page</h1>
    <p className="mt-3 text-sm text-slate-600">Please try again. If the problem continues, check your database connection and admin permissions.</p>
    <button onClick={reset} className="mt-6 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-bold text-white">Try again</button>
  </div>;
}
