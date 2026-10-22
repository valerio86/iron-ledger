/* Iron Ledger ⇄ Strava, as a Cloudflare Worker. Holds the Strava client secret and each user's Strava tokens
   (KV, keyed by Firebase uid) so neither ever reaches the public app.

   Every request must carry the user's Firebase ID token (Authorization: Bearer …), verified here against
   Google's public keys. Endpoints:
     POST /strava/exchange   {code, scope} → connect: trade the OAuth code for tokens, store them
     GET  /strava/activities ?after=<unix seconds>  → the user's activities (trimmed), refreshing tokens as needed
     POST /strava/disconnect → revoke access at Strava and forget the tokens

   Settings (Cloudflare dashboard → the worker → Settings → Variables and Secrets / Bindings):
     STRAVA_CLIENT_ID      text
     STRAVA_CLIENT_SECRET  secret
     FIREBASE_PROJECT_ID   text, e.g. iron-ledger-3bb13
     ALLOWED_ORIGINS       text, comma-separated, e.g. https://valerio86.github.io,http://127.0.0.1:8765
     TOKENS                KV namespace binding */

const JWKS_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";
let jwksCache = { keys: null, until: 0 };

export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
    const cors = allowed.includes(origin) ? {
      "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Max-Age": "86400", "Vary": "Origin",
    } : {};
    const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...cors } });
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (!cors["Access-Control-Allow-Origin"]) return json({ error: "origin_not_allowed" }, 403);

    let uid;
    try { uid = await verifyFirebase(req.headers.get("Authorization")?.replace(/^Bearer /, ""), env.FIREBASE_PROJECT_ID); }
    catch (e) { return json({ error: "unauthenticated", detail: e.message }, 401); }

    const url = new URL(req.url);
    try {
      if (url.pathname === "/strava/exchange" && req.method === "POST") {
        const { code, scope } = await req.json();   // scope: what the user ticked on Strava's consent page
        if (!/activity:read/.test(scope || "")) return json({ error: "scope_missing" }, 400);
        const t = await stravaToken(env, { grant_type: "authorization_code", code });
        await env.TOKENS.put(uid, JSON.stringify({ access_token: t.access_token, refresh_token: t.refresh_token, expires_at: t.expires_at, athlete: t.athlete?.id }));
        return json({ athlete: { id: t.athlete?.id, firstname: t.athlete?.firstname || "" } });
      }
      if (url.pathname === "/strava/activities" && req.method === "GET") {
        const tok = await freshToken(env, uid);
        if (!tok) return json({ error: "not_connected" }, 404);
        const after = Math.max(0, parseInt(url.searchParams.get("after") || "0", 10) || 0);
        const out = [];
        for (let page = 1; page <= 3; page++) {
          const r = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=100&page=${page}`, { headers: { Authorization: `Bearer ${tok}` } });
          if (r.status === 401) { await env.TOKENS.delete(uid); return json({ error: "not_connected" }, 404); }
          if (r.status === 429) return json({ error: "rate_limited" }, 429);
          if (!r.ok) return json({ error: "strava_error", status: r.status }, 502);
          const list = await r.json();
          for (const a of list) out.push({ id: String(a.id), name: a.name, sport: a.sport_type || a.type, start_local: a.start_date_local,
            moving: a.moving_time, elapsed: a.elapsed_time, distance: a.distance, re: a.suffer_score ?? null });
          if (list.length < 100) break;
        }
        return json({ activities: out });
      }
      if (url.pathname === "/strava/disconnect" && req.method === "POST") {
        const tok = await freshToken(env, uid).catch(() => null);
        if (tok) await fetch("https://www.strava.com/oauth/deauthorize", { method: "POST", headers: { Authorization: `Bearer ${tok}` } }).catch(() => {});
        await env.TOKENS.delete(uid);
        return json({ ok: true });
      }
      return json({ error: "not_found" }, 404);
    } catch (e) {
      return json({ error: "server_error", detail: e.message }, 500);
    }
  },
};

async function stravaToken(env, params) {
  const r = await fetch("https://www.strava.com/oauth/token", { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: env.STRAVA_CLIENT_ID, client_secret: env.STRAVA_CLIENT_SECRET, ...params }) });
  const t = await r.json();
  if (!r.ok) throw new Error(`strava token ${r.status}: ${t.message || ""}`);
  return t;
}

// Access token for this user, refreshed when it has under 5 minutes left. null when not connected.
async function freshToken(env, uid) {
  const raw = await env.TOKENS.get(uid); if (!raw) return null;
  const s = JSON.parse(raw);
  if (s.expires_at - 300 > Date.now() / 1000) return s.access_token;
  const t = await stravaToken(env, { grant_type: "refresh_token", refresh_token: s.refresh_token });
  await env.TOKENS.put(uid, JSON.stringify({ ...s, access_token: t.access_token, refresh_token: t.refresh_token, expires_at: t.expires_at }));
  return t.access_token;
}

// Verify a Firebase Auth ID token (RS256 JWT) and return the uid
async function verifyFirebase(token, project) {
  if (!token) throw new Error("no token");
  const [h, p, sig] = token.split(".");
  const dec = s => JSON.parse(new TextDecoder().decode(b64url(s)));
  const header = dec(h), claims = dec(p), now = Date.now() / 1000;
  if (header.alg !== "RS256") throw new Error("alg");
  if (claims.aud !== project || claims.iss !== `https://securetoken.google.com/${project}`) throw new Error("audience");
  if (!(claims.exp > now) || !(claims.iat < now + 60) || !claims.sub) throw new Error("expired");
  if (jwksCache.until < Date.now()) {
    const r = await fetch(JWKS_URL);
    const maxAge = +(/max-age=(\d+)/.exec(r.headers.get("Cache-Control") || "")?.[1] || 3600);
    jwksCache = { keys: (await r.json()).keys, until: Date.now() + maxAge * 1000 };
  }
  const jwk = jwksCache.keys.find(k => k.kid === header.kid);
  if (!jwk) throw new Error("unknown key");
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64url(sig), new TextEncoder().encode(`${h}.${p}`));
  if (!ok) throw new Error("signature");
  return claims.sub;
}
function b64url(s) {
  const b = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4));
  return Uint8Array.from(b, c => c.charCodeAt(0));
}
