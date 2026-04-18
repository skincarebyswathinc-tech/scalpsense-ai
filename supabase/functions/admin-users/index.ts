// Admin-only edge function:
//   GET   → list all users (auth email + profile + subscription)
//   POST  → manually set a user's plan to "premium" or "free"
//
// Manual premium grants are tagged with payment_provider = "admin_manual" so
// real Razorpay/Stripe-driven conversions are never overwritten.
//
// Caller MUST be an authenticated user with the "admin" role.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader) {
      return json({ error: "Missing Authorization header" }, 401);
    }

    // 1. Identify caller using their JWT
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return json({ error: "Invalid session" }, 401);
    }

    // 2. Verify admin role
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: roleRows } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin");
    if (!roleRows || roleRows.length === 0) {
      return json({ error: "Admin access required" }, 403);
    }

    // ── GET: list users ──────────────────────────────────────────
    if (req.method === "GET") {
      const { data: authUsers, error: listErr } =
        await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (listErr) return json({ error: listErr.message }, 500);

      const ids = authUsers.users.map((u) => u.id);
      const [{ data: profiles }, { data: subs }] = await Promise.all([
        admin.from("profiles").select("id, display_name, is_active, created_at").in("id", ids),
        admin.from("subscriptions").select("user_id, plan, status, expires_at, payment_provider").in("user_id", ids),
      ]);

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      const subMap = new Map((subs || []).map((s: any) => [s.user_id, s]));

      const users = authUsers.users.map((u) => {
        const sub = subMap.get(u.id) as any;
        return {
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          display_name: (profileMap.get(u.id) as any)?.display_name ?? null,
          is_active: (profileMap.get(u.id) as any)?.is_active ?? true,
          plan: sub?.plan ?? "free",
          status: sub?.status ?? "active",
          expires_at: sub?.expires_at ?? null,
          payment_provider: sub?.payment_provider ?? null,
          // Flag so the UI can warn before overriding a paid customer
          is_paid_customer:
            sub?.plan === "premium" &&
            sub?.payment_provider &&
            sub.payment_provider !== "admin_manual",
        };
      });

      return json({ users });
    }

    // ── POST: update plan ────────────────────────────────────────
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const { user_id, plan, force } = body as {
        user_id?: string;
        plan?: "free" | "premium";
        force?: boolean;
      };

      if (!user_id || (plan !== "free" && plan !== "premium")) {
        return json({ error: "user_id and plan ('free'|'premium') required" }, 400);
      }

      // Read existing sub
      const { data: existing } = await admin
        .from("subscriptions")
        .select("id, plan, payment_provider")
        .eq("user_id", user_id)
        .maybeSingle();

      // SAFETY: never silently downgrade or overwrite a real paid customer
      if (
        existing?.plan === "premium" &&
        existing.payment_provider &&
        existing.payment_provider !== "admin_manual" &&
        !force
      ) {
        return json(
          {
            error:
              "This user upgraded via " +
              existing.payment_provider +
              ". Refusing to overwrite a real payment. Pass force=true to override.",
          },
          409,
        );
      }

      const expires =
        plan === "premium"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : null;

      if (existing) {
        const { error } = await admin
          .from("subscriptions")
          .update({
            plan,
            status: "active",
            payment_provider: "admin_manual",
            expires_at: expires,
            started_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        if (error) return json({ error: error.message }, 500);
      } else {
        const { error } = await admin.from("subscriptions").insert({
          user_id,
          plan,
          status: "active",
          payment_provider: "admin_manual",
          expires_at: expires,
        });
        if (error) return json({ error: error.message }, 500);
      }

      return json({ ok: true, user_id, plan });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (e: any) {
    return json({ error: e.message || String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
