import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") || "/";
  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await saveSignupUsername(supabase);
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (!error) {
      await saveSignupUsername(supabase);
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(new URL("/login?error=true", request.url));
}

async function saveSignupUsername(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  const username = user?.user_metadata?.username;

  if (!user || typeof username !== "string" || !username) return;

  const { error } = await supabase.from("profiles").upsert(
    { id: user.id, username },
    { onConflict: "id", ignoreDuplicates: true },
  );

  if (error) {
    console.error("Supabase profile creation after confirmation failed:", error.message);
  }
}
