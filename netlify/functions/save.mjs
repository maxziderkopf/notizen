// src/save.mjs
import { getStore } from "@netlify/blobs";
var json = (o, status = 200) => new Response(JSON.stringify(o), {
  status,
  headers: {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "POST,OPTIONS"
  }
});
var save_default = async (req) => {
  if (req.method === "OPTIONS") return json({ ok: true });
  if (req.method !== "POST") return json({ error: "nur POST" }, 405);
  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "ung\xFCltige Daten" }, 400);
  }
  const { device, sub, items } = body || {};
  if (!device || typeof device !== "string" || device.length > 80) return json({ error: "device fehlt" }, 400);
  if (!sub || !sub.endpoint) return json({ error: "subscription fehlt" }, 400);
  if (!Array.isArray(items)) return json({ error: "items fehlt" }, 400);
  const clean = items.slice(0, 200).map((i) => ({
    id: String(i.id || "").slice(0, 40),
    at: Number(i.at) || 0,
    title: String(i.title || "Termin").slice(0, 80),
    body: String(i.body || "").slice(0, 120)
  })).filter((i) => i.at > 0);
  const store = getStore({ name: "reminders", consistency: "strong" });
  await store.setJSON(device, { sub, items: clean, saved: Date.now() });
  return json({ ok: true, gespeichert: clean.length });
};
export {
  save_default as default
};
