import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type ProductType = "stamp" | "doorplate";

type DirectOrderBody = {
  name: string;
  hanja?: string;
  engraving?: string;
  products: ProductType[];
  stampMaterial?: string;
  doorplateMaterial?: string;
  memo?: string;
  customer: { name: string; email: string };
  userId?: string | null;
  lang?: string;
};

const PRODUCT_META: Record<ProductType, { title: string; description: string; price: number }> = {
  stamp: {
    title: "인장 / 도장",
    description: "이름의 상징성과 소장 가치를 높이는 패키지",
    price: 39000,
  },
  doorplate: {
    title: "문패",
    description: "공간에 이름의 의미를 담는 패키지",
    price: 59000,
  },
};

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase service role env is missing.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as DirectOrderBody;

    const name = body?.name?.trim() ?? "";
    const hanja = body?.hanja?.trim() ?? "";
    const engraving = body?.engraving?.trim() || name;
    const stampMaterial = body?.stampMaterial?.trim() ?? "";
    const doorplateMaterial = body?.doorplateMaterial?.trim() ?? "";
    const memo = body?.memo?.trim() ?? "";
    const customerName = body?.customer?.name?.trim() ?? "";
    const customerEmail = body?.customer?.email?.trim() ?? "";
    const userId = body?.userId ?? null;
    const lang = body?.lang ?? "ko";

    if (!name) {
      return NextResponse.json({ ok: false, error: "이름이 필요합니다." }, { status: 400 });
    }
    const validProducts = (body?.products ?? []).filter(
      (p): p is ProductType => p === "stamp" || p === "doorplate"
    );
    if (validProducts.length === 0) {
      return NextResponse.json({ ok: false, error: "상품을 선택해 주세요." }, { status: 400 });
    }
    if (!customerName) {
      return NextResponse.json({ ok: false, error: "주문자 이름이 필요합니다." }, { status: 400 });
    }
    if (!customerEmail || !isValidEmail(customerEmail)) {
      return NextResponse.json({ ok: false, error: "유효한 이메일이 필요합니다." }, { status: 400 });
    }

    const total = validProducts.reduce((sum, p) => sum + PRODUCT_META[p].price, 0);

    const noteParts = [
      `이름: ${name}${hanja ? ` (${hanja})` : ""}`,
      `각인 문구: ${engraving}`,
      stampMaterial && validProducts.includes("stamp") ? `도장 재질 요청: ${stampMaterial}` : null,
      doorplateMaterial && validProducts.includes("doorplate") ? `문패 재질 요청: ${doorplateMaterial}` : null,
      memo ? `추가 요청: ${memo}` : null,
    ].filter(Boolean).join("\n");

    const supabase = getAdminClient();

    const { data: orderRow, error: orderError } = await supabase
      .from("naming_orders")
      .insert({
        user_id: userId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_note: noteParts,
        total_amount: total,
        currency: "KRW",
        status: "pending",
      })
      .select("id")
      .single();

    if (orderError || !orderRow?.id) {
      return NextResponse.json(
        { ok: false, error: orderError?.message ?? "주문 저장 실패" },
        { status: 500 }
      );
    }

    const materialMap: Record<ProductType, string> = {
      stamp: stampMaterial,
      doorplate: doorplateMaterial,
    };

    const orderItems = validProducts.map((p) => {
      const mat = materialMap[p];
      return {
        order_id: orderRow.id,
        user_id: userId,
        brief_id: null,
        package_type: `direct-${p}`,
        title: `${PRODUCT_META[p].title} — ${name}${hanja ? ` ${hanja}` : ""}`,
        description: [PRODUCT_META[p].description, mat ? `재질: ${mat}` : null]
          .filter(Boolean)
          .join(" / "),
        price: PRODUCT_META[p].price,
        quantity: 1,
        lang,
      };
    });

    const { error: itemError } = await supabase.from("naming_order_items").insert(orderItems);

    if (itemError) {
      await supabase.from("naming_orders").delete().eq("id", orderRow.id);
      return NextResponse.json(
        { ok: false, error: itemError.message ?? "주문 항목 저장 실패" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, orderId: orderRow.id, total });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
