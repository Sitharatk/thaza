import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { CartSummaryBar } from "@/components/CartSummaryBar";

export default function Home() {
  return <><Header /><main className="pb-28 sm:pb-0"><Hero /><FeaturedProducts /><WhyChooseUs /><About /><Contact /></main><Footer /><CartSummaryBar /></>;
}
