"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useCart } from "@/src/context/CartContext";
import { createWhatsAppOrder, type CustomerDetails } from "@/src/utils/createWhatsAppOrder";

const deliveryCharge = 40;
const paymentMethod = "Cash on Delivery";

const initialDetails: CustomerDetails = {
  fullName: "",
  phoneNumber: "",
  deliveryAddress: "",
  landmark: "",
  city: "",
  pincode: "",
};

const fields: { name: keyof CustomerDetails; label: string; required: boolean; type?: string }[] = [
  { name: "fullName", label: "Full Name", required: true },
  { name: "phoneNumber", label: "Phone Number", required: true, type: "tel" },
  { name: "deliveryAddress", label: "Delivery Address", required: true },
  { name: "landmark", label: "Landmark", required: false },
  { name: "city", label: "City", required: true },
  { name: "pincode", label: "Pincode", required: true, type: "text" },
];

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const [details, setDetails] = useState(initialDetails);
  const [error, setError] = useState("");
  const grandTotal = totalPrice + (items.length > 0 ? deliveryCharge : 0);

  const updateDetails = (name: keyof CustomerDetails, value: string) => {
    setDetails((current) => ({ ...current, [name]: value }));
    if (error) setError("");
  };

  const placeOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const missingField = fields.find(({ name, required }) => required && !details[name].trim());

    if (missingField) {
      setError(`Please enter your ${missingField.label.toLowerCase()}.`);
      return;
    }

    window.location.assign(createWhatsAppOrder(details, items, totalPrice, deliveryCharge, grandTotal, paymentMethod));
  };

  if (items.length === 0) {
    return <main className="bg-[var(--cream)] px-4 py-16 sm:py-24"><div className="mx-auto max-w-xl rounded-3xl border border-[var(--line)] bg-white px-6 py-16 text-center shadow-sm"><p className="text-lg font-bold text-[var(--navy)]">Your cart is empty.</p><p className="mt-2 text-sm text-slate-500">Add something fresh before checking out.</p><Link href="/products" className="mt-7 inline-flex rounded-full bg-[var(--navy)] px-6 py-3 text-sm font-bold text-white">Browse Products</Link></div></main>;
  }

  return (
    <main className="bg-[var(--cream)] pb-16 pt-10 sm:pb-24 sm:pt-14">
      <div className="section-shell">
        <div className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--green)]">Almost home</p><h1 className="serif mt-3 text-5xl font-medium leading-none tracking-[-0.05em] text-[var(--navy)]">Complete your<br /><em className="text-[var(--green)]">order.</em></h1></div>
        <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <section className="rounded-3xl border border-[var(--line)] bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-7"><h2 className="text-xl font-bold text-[var(--navy)]">Delivery details</h2><p className="mt-1 text-sm text-slate-500">Tell us where to bring your order.</p></div>
            <div className="grid gap-5 sm:grid-cols-2">
              {fields.map(({ name, label, required, type = "text" }) => <label key={name} className={name === "deliveryAddress" ? "sm:col-span-2" : ""}><span className="mb-2 block text-sm font-bold text-[var(--navy)]">{label}{required ? <span className="text-[var(--green)]"> *</span> : null}</span><input required={required} type={type} value={details[name]} onChange={(event) => updateDetails(name, event.target.value)} className="w-full rounded-xl border border-[var(--line)] bg-[var(--cream)] px-4 py-3 text-sm text-[var(--navy)] outline-none transition placeholder:text-slate-400 focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--mint)]" /></label>)}
            </div>
            {error ? <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
            <div className="mt-8 border-t border-[var(--line)] pt-7"><h2 className="text-xl font-bold text-[var(--navy)]">Payment method</h2><label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-[var(--green)] bg-[var(--mint)] p-4"><input type="radio" name="payment" value={paymentMethod} defaultChecked className="h-4 w-4 accent-[var(--green)]" /><span><span className="block text-sm font-bold text-[var(--navy)]">{paymentMethod}</span><span className="mt-1 block text-xs text-slate-500">Pay when your order arrives.</span></span></label></div>
          </section>
          <aside className="rounded-3xl border border-[var(--line)] bg-white p-5 shadow-sm sm:p-7"><h2 className="text-xl font-bold text-[var(--navy)]">Order summary</h2><div className="mt-6 divide-y divide-[var(--line)]">{items.map(({ product, quantity }) => <div key={product.id} className="flex justify-between gap-4 py-4 first:pt-0"><div className="min-w-0"><p className="truncate text-sm font-bold text-[var(--navy)]">{product.name}</p><p className="mt-1 text-xs text-slate-500">Quantity: {quantity}</p></div><p className="shrink-0 text-sm font-bold text-[var(--navy)]">₹{product.price * quantity}</p></div>)}</div><div className="mt-3 space-y-3 border-t border-[var(--line)] pt-5 text-sm"><div className="flex justify-between text-slate-500"><span>Subtotal</span><span className="font-semibold text-[var(--navy)]">₹{totalPrice}</span></div><div className="flex justify-between text-slate-500"><span>Delivery Charge</span><span className="font-semibold text-[var(--navy)]">₹{deliveryCharge}</span></div><div className="flex justify-between pt-3 text-base font-bold text-[var(--navy)]"><span>Grand Total</span><span className="text-[var(--green)]">₹{grandTotal}</span></div></div><button type="submit" className="mt-7 flex w-full items-center justify-center rounded-full bg-[var(--green)] px-5 py-4 text-sm font-bold text-white transition hover:brightness-95">Place Order on WhatsApp</button></aside>
        </form>
      </div>
    </main>
  );
}
