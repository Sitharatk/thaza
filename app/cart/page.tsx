import { CartReview } from "@/components/CartReview";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata = { title: "Review Order | Thaza", description: "Review your fresh Thaza order." };

export default function CartPage() {
  return <><Header /><main><CartReview /></main><Footer /></>;
}