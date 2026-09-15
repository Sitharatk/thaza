import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { WhyChooseUs } from "@/components/WhyChooseUs";

export default function Home() {
  return <><Header /><main><Hero /><FeaturedProducts /><WhyChooseUs /><About /><Contact /></main><Footer /></>;
}
