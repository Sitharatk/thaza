import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductCatalogue } from "@/components/ProductCatalogue";
import { CartSummaryBar } from "@/components/CartSummaryBar";
import { getProducts } from "@/src/lib/products";

export const dynamic = "force-dynamic";

export const metadata = { title: "Products | Thaza", description: "Shop fresh chicken cuts and quality food products from Thaza." };

export default async function ProductsPage() {
  const products = await getProducts().catch(() => null);
  return <><Header /><main>{products ? <ProductCatalogue products={products} /> : <p role="alert" className="section-shell py-20 text-center">The product catalogue is temporarily unavailable. Please try again shortly.</p>}</main><Footer /><CartSummaryBar /></>;
}
