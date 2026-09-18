import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { CartSummaryBar } from "@/components/CartSummaryBar";
import { getProducts } from "@/src/lib/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getProducts().catch(() => null);
  return <><Header /><main className="pb-28 sm:pb-0"><Hero />{products ? <FeaturedProducts products={products} /> : <p role="alert" className="section-shell py-12 text-center">The product catalogue is temporarily unavailable. Please try again shortly.</p>}<WhyChooseUs /><About /><Contact /></main><Footer /><CartSummaryBar /></>;
}
