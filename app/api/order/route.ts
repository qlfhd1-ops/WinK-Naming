import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Customer = {
  name: string;
  email: string;
  note?: string;
};

type OrderItem = {
  id: string;
  briefId: string;
  packageType: string;
  title: string;
  description?: string;
  price: number;
  quantity: number;
  lang: string;
  createdAt?: string;
};

type RequestBody = {
  customer?: Customer;
  items?: OrderItem[];
  total?: number;
  userId?: string | null;
  lang?: string;
};

const SUPPORTED_LANGS = new Set(["ko", "en", "ja", "zh", "es"]);

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase service role env is missing.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeLang(value?: string) {
  if (value && SUPPORTED_LANGS.has(value)) {
    return value;
  }
  return "ko";
}

function validateItems(items: OrderItem[]) {
  for (const item of items) {
    if (!item?.briefId?.trim()) {
      return "브리프 ID가 없는 상품이 있습니다.";
    }

    if (!item?.packageType?.trim()) {
      return "패키지 타입이 없는 상품이 있습니다.";
    }

    if (!item?.title?.trim()) {
      return "상품명이 비어 있는 항목이 있습니다.";
    }

    if (!Number.isFinite(item.price) || item.price < 0) {
      return "상품 금액이 올바르지 않은 항목이 있습니다.";
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return "상품 수량이 올바르지 않은 항목이 있습니다.";
    }
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;

    const customer = body?.customer;
    const items = Array.isArray(body?.items) ? body.items : [];
    const total = Number(body?.total ?? 0);
    const userId = typeof body?.userId === "string" ? body.userId : null;
    const requestLang = normalizeLang(body?.lang);

    const customerName = customer?.name?.trim() || "";
    const customerEmail = customer?.email?.trim() || "";
    const customerNote = customer?.note?.trim() || null;

    if (!customerName) {
      return NextResponse.json(
        { ok: false, error: "이름이 필요합니다." },
        { status: 400 }
      );
    }

    if (!customerEmail || !isValidEmail(customerEmail)) {
      return NextResponse.json(
        { ok: false, error: "유효한 이메일이 필요합니다." },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        { ok: false, error: "주문 상품이 없습니다." },
        { status: 400 }
      );
    }

    const itemValidationError = validateItems(items);
    if (itemValidationError) {
      return NextResponse.json(
        { ok: false, error: itemValidationError },
        { status: 400 }
      );
    }

    const calculatedTotal = items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    if (!Number.isFinite(total) || total <= 0) {
      return NextResponse.json(
        { ok: false, error: "총액이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    if (calculatedTotal !== total) {
      return NextResponse.json(
        { ok: false, error: "주문 총액이 상품 합계와 일치하지 않습니다." },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    const { data: orderRow, error: orderError } = await supabase
      .from("naming_orders")
      .insert({
        user_id: userId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_note: customerNote,
        total_amount: total,
        currency: "KRW",
        status: "pending",
      })
      .select("id")
      .single();

    if (orderError || !orderRow?.id) {
      return NextResponse.json(
        { ok: false, error: orderError?.message || "주문 저장 실패" },
        { status: 500 }
      );
    }

    const orderItems = items.map((item) => ({
      order_id: orderRow.id,
      user_id: userId,
      brief_id: item.briefId.trim(),
      package_type: item.packageType.trim(),
      title: item.title.trim(),
      description: item.description?.trim() || null,
      price: Number(item.price),
      quantity: Number(item.quantity),
      lang: normalizeLang(item.lang || requestLang),
    }));

    const { error: itemError } = await supabase
      .from("naming_order_items")
      .insert(orderItems);

    if (itemError) {
      await supabase.from("naming_orders").delete().eq("id", orderRow.id);

      return NextResponse.json(
        { ok: false, error: itemError.message || "주문 항목 저장 실패" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      orderId: orderRow.id,
      message: "주문 저장 완료",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}