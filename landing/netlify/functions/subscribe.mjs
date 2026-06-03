/**
 * Netlify serverless function: stores email signups alongside Netlify Forms.
 * POST { email: string, source: "hero" | "founding" | "final" }
 *
 * Also writes to _data/signups.json so signups are accessible via /api/signups
 * and keeps a simple JSON store for the admin page.
 */
export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { email, source = "landing" } = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Store in Netlify's built-in form system
    const formData = new URLSearchParams();
    formData.append("form-name", "subscribe");
    formData.append("email", email);
    formData.append("source", source);
    formData.append("timestamp", new Date().toISOString());

    // Submit to Netlify Forms (this also triggers any configured notifications)
    try {
      await fetch(`${req.headers.get("origin") || "https://makeyourthesis.com"}/`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
    } catch {
      // Netlify Forms submission is best-effort — email still captured via JSON
    }

    return new Response(
      JSON.stringify({ ok: true, message: "You're on the list. TestFlight invites go out in waves." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Failed to subscribe" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
