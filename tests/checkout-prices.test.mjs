import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import ts from "typescript";

function loadOrderRoute(products, saveOrder) {
  const filename = fileURLToPath(new URL("../app/api/orders/route.ts", import.meta.url));
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const localRequire = createRequire(filename);
  const exports = {};
  runInThisContext(`(function(require, exports) {${outputText}\n})`, { filename })((name) => {
    if (name === "@/src/lib/products") return { getProducts: async () => products };
    if (name === "@/src/lib/supabase") return { getSupabaseClient: () => ({ rpc: saveOrder }) };
    return localRequire(name);
  }, exports);
  return exports.POST;
}

const product = { id: "new-product", name: "New cut", weight: "500 g", price: 225.50, category: "Chicken", image: "/products/chicken-curry-cut.svg", accent: "#f6eee1" };
const body = {
  customer: { fullName: "Test", phoneNumber: "0000000000", deliveryAddress: "Test address", city: "Test city", pincode: "000000" },
  items: [{ productId: product.id, quantity: 2 }],
  expectedSubtotal: 451,
  paymentMethod: "Cash on Delivery",
};
const request = (value) => new Request("http://localhost/api/orders", { method: "POST", body: JSON.stringify(value) });

test("checkout uses saved catalogue prices and returns the same totals for WhatsApp", async () => {
  let saved;
  const POST = loadOrderRoute([product], async (name, args) => {
    assert.equal(name, "create_order_with_items");
    saved = args;
    return { data: [{ order_id: "test-order", order_number: "THZ-TEST" }], error: null };
  });
  const response = await POST(request(body));
  assert.equal(response.status, 201);
  assert.equal(saved.p_items[0].price, 225.50);
  assert.equal(saved.p_items[0].line_total, 451);
  assert.equal(saved.p_grand_total, 491);
  const result = await response.json();
  assert.equal(result.grandTotal, saved.p_grand_total);
  assert.equal(result.subtotal, saved.p_subtotal);
  assert.equal(result.items[0].product.price, saved.p_items[0].price);
});

test("stale prices and unavailable products never create an order", async () => {
  const neverSave = () => { assert.fail("An invalid or stale cart must not be saved"); };
  const POST = loadOrderRoute([product], neverSave);
  assert.equal((await POST(request({ ...body, expectedSubtotal: 420 }))).status, 409);
  assert.equal((await loadOrderRoute([], neverSave)(request(body))).status, 409);
  assert.equal((await POST(request({ ...body, expectedSubtotal: undefined }))).status, 400);
});
