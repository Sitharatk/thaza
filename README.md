This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Supabase order storage

1. Copy `.env.example` to `.env.local` and add the project URL and anon key from Supabase.
2. Run `supabase/migrations/001_create_orders.sql` in the Supabase SQL Editor. It creates the `orders` and `order_items` tables, the order number sequence, and the transactional order RPC.
3. Run `supabase/migrations/002_admin_orders_and_products.sql` in the Supabase SQL Editor. Existing projects should run only this new migration; do not rerun migration 001. It grants existing admins access to orders, restricts order updates to status, creates the shared product catalogue, and seeds the four current products without overwriting existing products. It does not delete orders or change admin membership.
4. Start the app with `npm run dev` (Node.js 22 or newer is required by the installed Supabase SDK).

Orders are saved through `/api/orders` before WhatsApp opens. The server calculates prices from the product catalogue, and no service-role key is used in the app.

The admin Products page at `/admin/products` supports search, category filters, adding products, uploading images, descriptions, stock quantities, featured products, editing prices and hiding products from the storefront. Product edits persist in Supabase and are used by the home page, catalogue and checkout. Checkout rejects changed prices or unavailable items before creating an order and asks the customer to review the refreshed cart. Past orders retain their original prices. The migration creates a public `products` storage bucket for storefront images; only admins can upload or replace files.

Only accounts already listed in `public.admin_users` can read orders or manage products. Provision admin records manually in the Supabase dashboard; customers cannot grant themselves admin access. Row level security stays enabled. An empty order list can mean the admin read policy is missing; the Supabase table editor uses elevated privileges and can still show those orders.

Run `npm test` for session, database permission and checkout regression checks. Database tests use an isolated in-memory PostgreSQL instance and do not touch Supabase.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
