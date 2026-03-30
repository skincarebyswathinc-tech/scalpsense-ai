import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { email } = await req.json();

  // Find user by email
  const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
  if (listErr) return new Response(JSON.stringify({ error: listErr.message }), { status: 400 });

  const user = users.find(u => u.email === email);
  if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });

  // Check if already admin
  const { data: existing } = await supabaseAdmin.from("user_roles").select("id").eq("user_id", user.id).eq("role", "admin").maybeSingle();
  if (existing) return new Response(JSON.stringify({ success: true, user_id: user.id, note: "already admin" }));

  // Assign admin role
  const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
    user_id: user.id,
    role: "admin",
  });

  if (roleError) return new Response(JSON.stringify({ error: roleError.message }), { status: 400 });

  return new Response(JSON.stringify({ success: true, user_id: user.id }));
});
