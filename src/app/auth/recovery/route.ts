import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function invalidRecoveryResponse(request: NextRequest) {
  return NextResponse.redirect(
    new URL("/forgot-password?error=invalid-link", request.url),
  );
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash =
    request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const supabase = await createClient();

  if (tokenHash && type === "recovery") {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "recovery",
    });

    if (!error) {
      return NextResponse.redirect(
        new URL("/reset-password", request.url),
      );
    }

    return invalidRecoveryResponse(request);
  }

  if (code) {
    const { error } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(
        new URL("/reset-password", request.url),
      );
    }
  }

  return invalidRecoveryResponse(request);
}
