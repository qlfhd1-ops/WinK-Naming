import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type PackageType = "stamp" | "doorplate" | "giftcard";

type RequestBody = {
  briefId?: string;
  packageType?: PackageType;
  userId?: string | null;
};

const ALLOWED_PACKAGE_TYPES = new Set<PackageType>([
  "stamp",
  "doorplate",
  "giftcard",
]);

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase admin env is missing.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function getPackageMeta(packageType: PackageType) {
  switch (packageType) {
    case "stamp":
      return {
        title: "인장 / 도장",
        description: "이름의 상징성과 소장 가치를 높이는 패키지",
        price: 39000,
      };
    case "doorplate":
      return {
        title: "문패",
        description: "공간에 이름의 의미를 담는 패키지",
        price: 59000,
      };
    case "giftcard":
      return {
        title: "이름 선물 카드",
        description: "이름을 선물처럼 전달하는 카드형 결과물",
        price: 9900,
      };
    default:
      return {
        title: "",
        description: "",
        price: 0,
      };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function tableExists(supabase: any, tableName: string) {
  const { error } = await supabase.from(tableName).select("*").limit(1);
  return !error;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;

    const briefId = typeof body?.briefId === "string" ? body.briefId.trim() : "";
    const packageType = body?.packageType;
    const userId = typeof body?.userId === "string" ? body.userId : null;

    if (!briefId) {
      return NextResponse.json(
        { ok: false, error: "briefId가 필요합니다." },
        { status: 400 }
      );
    }

    if (!packageType || !ALLOWED_PACKAGE_TYPES.has(packageType)) {
      return NextResponse.json(
        { ok: false, error: "유효한 packageType이 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    const meta = getPackageMeta(packageType);

    const hasBriefsTable = await tableExists(supabase, "naming_briefs");
    if (!hasBriefsTable) {
      return NextResponse.json(
        { ok: false, error: "naming_briefs 테이블을 찾을 수 없습니다." },
        { status: 500 }
      );
    }

    const { data: briefRow, error: briefError } = await supabase
      .from("naming_briefs")
      .select("id, lang")
      .eq("id", briefId)
      .single();

    if (briefError || !briefRow?.id) {
      return NextResponse.json(
        { ok: false, error: briefError?.message || "브리프를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const hasPackagesTable = await tableExists(supabase, "naming_packages");

    if (hasPackagesTable) {
      const { error: insertError } = await supabase.from("naming_packages").insert({
        brief_id: briefId,
        user_id: userId,
        package_type: packageType,
        title: meta.title,
        description: meta.description,
        price: meta.price,
        lang: typeof briefRow.lang === "string" ? briefRow.lang : "ko",
      });

      if (insertError) {
        return NextResponse.json(
          { ok: false, error: insertError.message || "패키지 저장 실패" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      package: {
        briefId,
        packageType,
        title: meta.title,
        description: meta.description,
        price: meta.price,
        lang: typeof briefRow.lang === "string" ? briefRow.lang : "ko",
      },
      message: hasPackagesTable
        ? "패키지 저장 완료"
        : "패키지 선택 완료",
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