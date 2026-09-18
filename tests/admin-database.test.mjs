import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

test("admin migration exposes saved orders only to admins and enables the shared product catalogue", async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create schema auth;
      create function auth.jwt() returns jsonb language sql stable as
        $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
      create schema storage;
      create table storage.buckets (id text primary key, name text, public boolean);
      create table storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text);
      grant usage on schema public, auth to anon, authenticated;
      grant usage on schema storage to anon, authenticated;
      grant select, insert, update on storage.buckets, storage.objects to anon, authenticated;
    `);
    const initial = readFileSync(new URL("../supabase/migrations/001_create_orders.sql", import.meta.url), "utf8");
    // PGlite has core gen_random_uuid(); the pgcrypto extension is unnecessary here.
    await db.exec(initial.replace("create extension if not exists pgcrypto;", ""));
    await db.exec(`
      grant select, insert, update, delete on all tables in schema public to anon, authenticated;
      insert into public.admin_users(email) values ('admin@example.test');
      select * from public.create_order_with_items('Test customer', '0000000000', 'Test address', '', 'Test city', '000000', 210, 40, 250, 'Cash on Delivery',
        '[{"product_id":"chicken-curry-cut","product_name":"Chicken Curry Cut","weight":"1 kg","price":210,"quantity":1,"line_total":210}]');
    `);
    async function asRole(role, email = "") {
      await db.exec("reset role");
      await db.query("select set_config('request.jwt.claims', $1, false)", [JSON.stringify({ role, email })]);
      await db.exec(`set role ${role}`);
    }
    await asRole("authenticated", "admin@example.test");
    assert.equal((await db.query("select * from orders")).rows.length, 0, "reproduces the original empty dashboard for a valid admin");
    await db.exec("reset role");
    const migration = readFileSync(new URL("../supabase/migrations/002_admin_orders_and_products.sql", import.meta.url), "utf8");
    await db.exec(migration);
    await db.exec(migration); // Safe to rerun without duplicating or overwriting products.

    await asRole("authenticated", "admin@example.test");
    assert.equal((await db.query("select * from orders")).rows.length, 1);
    assert.equal((await db.query("select * from order_items")).rows.length, 1);
    assert.equal((await db.query("select sum(grand_total) as total from orders")).rows[0].total, "250");
    assert.equal((await db.query("update orders set status = 'confirmed' returning status")).rows[0].status, "confirmed");
    await assert.rejects(db.query("update orders set grand_total = 1"), /permission denied/);

    assert.equal((await db.query("select * from products")).rows.length, 4);
    const added = await db.query("insert into products(name, weight, price, category) values ('Test cut', '500 g', 125.50, 'Chicken') returning id");
    assert.ok(added.rows[0].id);
    await db.query("update products set price = 225.50 where id = 'chicken-curry-cut'");
    await db.query("update products set is_active = false where id = $1", [added.rows[0].id]);
    assert.equal((await db.query("select * from products")).rows.length, 5);
    await assert.rejects(db.query("insert into products(name, weight, price, category) values ('Bad price', '1 kg', -1, 'Chicken')"), /check constraint/);

    await asRole("anon");
    assert.equal((await db.query("select * from orders")).rows.length, 0);
    assert.equal((await db.query("select * from order_items")).rows.length, 0);
    assert.equal((await db.query("select * from products")).rows.length, 4, "hidden product is not public");
    assert.equal(Number((await db.query("select price from products where id = 'chicken-curry-cut'")).rows[0].price), 225.50, "storefront sees the saved admin price");
    await assert.rejects(db.query("insert into products(name, weight, price, category) values ('Unauthorized', '1 kg', 1, 'Chicken')"), /permission denied|row-level security/);

    await asRole("authenticated", "customer@example.test");
    assert.equal((await db.query("select * from orders")).rows.length, 0);
    assert.equal((await db.query("update orders set status = 'delivered' returning id")).rows.length, 0);
    assert.equal((await db.query("update products set price = 1 returning id")).rows.length, 0);
    await assert.rejects(db.query("insert into admin_users(email) values ('customer@example.test')"), /permission denied/);
    await assert.rejects(db.query("insert into products(name, weight, price, category) values ('Unauthorized', '1 kg', 1, 'Chicken')"), /row-level security/);
  } finally { await db.close(); }
});
