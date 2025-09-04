import { NextResponse } from "next/server";

// Firebase signup via REST API
// https://firebase.google.com/docs/reference/rest/auth#section-create-email-password
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body || {};
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    const apiKey = process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing FIREBASE_API_KEY/NEXT_PUBLIC_FIREBASE_API_KEY" }, { status: 500 });
    }
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
      cache: 'no-store',
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data?.error?.message || "Registration failed" }, { status: res.status });
    }
    return NextResponse.json({ ok: true, uid: data.localId, email: data.email });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}
