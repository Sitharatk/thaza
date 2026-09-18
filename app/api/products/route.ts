import { NextResponse } from "next/server";
import { getProducts } from "@/src/lib/products";

export async function GET() {
  try {
    return NextResponse.json(await getProducts(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "The product catalogue could not be loaded." }, { status: 503 });
  }
}
