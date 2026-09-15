import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductCatalogue } from "@/components/ProductCatalogue";

export const metadata = { title: "Products | Thaza", description: "Shop fresh chicken cuts and quality food products from Thaza." };

export default function ProductsPage() {
  return <><Header /><main><ProductCatalogue /></main><Footer /></>;
}