import type { Product } from "@/types/product";

export const products: Product[] = [
  { id: "chicken-curry-cut", name: "Chicken Curry Cut", weight: "1 kg", price: 210, category: "Chicken", image: "/products/chicken-curry-cut.svg", accent: "#f6eee1" },
  { id: "chicken-chilli-cut", name: "Chicken Chilli Cut", weight: "1 kg", price: 210, category: "Chicken", image: "/products/chicken-chilli-cut.svg", accent: "#eaf1df" },
  { id: "chicken-biryani-cut", name: "Chicken Biryani Cut", weight: "1 kg", price: 220, category: "Chicken", image: "/products/chicken-biryani-cut.svg", accent: "#f8eadc" },
  { id: "boneless-chicken-breast", name: "Boneless Chicken Breast", weight: "500 g", price: 220, category: "Chicken", image: "/products/boneless-chicken-breast.svg", accent: "#e3f0ea" },
];