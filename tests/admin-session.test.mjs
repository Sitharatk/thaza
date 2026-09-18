import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import ts from "typescript";

// Run the actual application factories, replacing only Next's request context.
function loadFactory(relativePath, cookieStore) {
  const filename = fileURLToPath(new URL(`../${relativePath}`, import.meta.url));
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const localRequire = createRequire(filename);
  const exports = {};
  runInThisContext(`(function(require, exports) {${outputText}\n})`, { filename })(
    (name) => name === "next/headers" ? { cookies: async () => cookieStore } : localRequire(name),
    exports,
  );
  return exports;
}

test("a browser admin login is visible to server requests and logout clears it", async (t) => {
  const cookieJar = new Map();
  const storage = new Map();
  const localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  };
  const document = {
    visibilityState: "hidden",
    get cookie() {
      return [...cookieJar].map(([name, value]) => `${name}=${value}`).join("; ");
    },
    set cookie(value) {
      const pair = value.split(";")[0];
      const separator = pair.indexOf("=");
      const name = pair.slice(0, separator);
      if (/max-age=0(?:;|$)/i.test(value)) cookieJar.delete(name);
      else cookieJar.set(name, pair.slice(separator + 1));
    },
  };
  const cookieStore = {
    getAll: () => [...cookieJar].map(([name, value]) => ({ name, value: decodeURIComponent(value) })),
    set: (name, value, options) => {
      if (options?.maxAge === 0) cookieJar.delete(name);
      else cookieJar.set(name, encodeURIComponent(value));
    },
  };
  const globals = {
    document,
    window: { document, localStorage, location: { href: "http://localhost/admin/login" }, addEventListener() {}, removeEventListener() {} },
    localStorage,
    BroadcastChannel: undefined,
    // Auth does not open realtime sockets; fail if the test unexpectedly does.
    WebSocket: class { constructor() { throw new Error("Unexpected realtime connection"); } },
  };
  for (const [name, value] of Object.entries(globals)) {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
    t.after(() => descriptor ? Object.defineProperty(globalThis, name, descriptor) : delete globalThis[name]);
  }
  for (const [name, value] of Object.entries({
    NEXT_PUBLIC_SUPABASE_URL: "https://session-test.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
  })) {
    const previous = process.env[name];
    process.env[name] = value;
    t.after(() => previous === undefined ? delete process.env[name] : process.env[name] = previous);
  }
  const user = { id: "test-admin-id", email: "admin@example.test", aud: "authenticated", role: "authenticated" };
  const payload = Buffer.from(JSON.stringify({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url");
  const token = `eyJhbGciOiJIUzI1NiJ9.${payload}.test-signature`;
  t.mock.method(globalThis, "fetch", async (input, options) => {
    const url = new URL(typeof input === "string" ? input : input.url);
    if (url.pathname === "/auth/v1/token") {
      if (JSON.parse(options.body).password !== "test-password") {
        return Response.json({ msg: "Invalid login credentials", error_code: "invalid_credentials" }, { status: 400 });
      }
      return Response.json({ access_token: token, refresh_token: "test-refresh", expires_in: 3600, token_type: "bearer", user });
    }
    assert.equal(new Headers(options.headers).get("authorization"), `Bearer ${token}`);
    if (url.pathname === "/auth/v1/user") return Response.json(user);
    if (url.pathname === "/auth/v1/logout") return new Response(null, { status: 204 });
    throw new Error(`Unexpected request: ${url.pathname}`);
  });
  const { createSupabaseBrowserClient } = loadFactory("src/lib/supabase/client.ts");
  const { createSupabaseServerClient } = loadFactory("src/lib/supabase/server.ts", cookieStore);
  const browser = createSupabaseBrowserClient();
  t.after(() => browser.auth.stopAutoRefresh());

  const invalidLogin = await browser.auth.signInWithPassword({ email: user.email, password: "wrong" });
  assert.ok(invalidLogin.error);
  assert.equal((await (await createSupabaseServerClient()).auth.getUser()).data.user, null);

  const login = await browser.auth.signInWithPassword({ email: user.email, password: "test-password" });
  assert.equal(login.error, null);
  assert.equal(login.data.user.id, user.id);
  const server = await createSupabaseServerClient();
  const serverUser = await server.auth.getUser();
  assert.equal(serverUser.error, null, "dashboard must receive the browser's authenticated session");
  assert.equal(serverUser.data.user.id, user.id);
  assert.equal((await (await createSupabaseServerClient()).auth.getUser()).data.user.id, user.id, "session survives a fresh request");

  assert.equal((await server.auth.signOut()).error, null);
  assert.equal((await (await createSupabaseServerClient()).auth.getUser()).data.user, null);
});
