export default async function handler(req, res) {
  const raw = req.query?.url;
  if (!raw) return res.status(400).json({ error: "Missing url" });
  let target;
  try {
    target = new URL(raw);
    if (!["http:", "https:"].includes(target.protocol)) throw new Error();
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    const r = await fetch(target.href, {
      headers: { "user-agent": "WebToAPKBuilder/1.0 (+metadata fetch)" },
      redirect: "follow"
    });
    if (!r.ok) return res.status(502).json({ error: `Target returned ${r.status}` });
    const html = (await r.text()).slice(0, 1000000);
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
      ?.replace(/\s+/g, " ").trim();

    const iconMatch =
      html.match(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/i) ||
      html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*icon[^"']*["']/i);

    let favicon = null;
    if (iconMatch?.[1]) favicon = new URL(iconMatch[1], r.url || target.href).href;
    if (!favicon) favicon = new URL("/favicon.ico", r.url || target.href).href;

    res.setHeader("Cache-Control", "public, max-age=300");
    return res.status(200).json({ title: title || null, favicon, finalUrl: r.url || target.href });
  } catch (e) {
    return res.status(502).json({ error: "Unable to read target site" });
  }
}
