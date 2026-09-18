export type ProductCategory = "Chicken" | "Beef" | "Mutton" | "Ready to Cook";
export type Product = { id: string; name: string; weight: string; price: number; category: ProductCategory; image: string; accent: string; description?: string; stock_quantity?: number; featured?: boolean };
export type ManagedProduct = Product & { is_active: boolean; description: string; stock_quantity: number; featured: boolean };
