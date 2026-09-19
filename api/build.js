export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const upstream = await fetch(
      "https://pwabuilder-cloudapk.azurewebsites.net/generateAppPackage",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "PWABuilder/1.0 WebToAPKBuilder"
        },
        body: JSON.stringify(req.body)
      }
    );

    const contentType = upstream.headers.get("content-type") || "application/zip";
    const disposition = upstream.headers.get("content-disposition");
    const buffer = Buffer.from(await upstream.arrayBuffer());

    res.statusCode = upstream.status;
    res.setHeader("Content-Type", contentType);
    if (disposition) res.setHeader("Content-Disposition", disposition);
    res.setHeader("Cache-Control", "no-store");

    if (!upstream.ok) {
      let message = buffer.toString("utf8").slice(0, 4000);
      try {
        const json = JSON.parse(message);
        message = json.message || json.error || message;
      } catch {}
      return res.status(upstream.status).send(`CloudAPK: ${message}`);
    }

    return res.send(buffer);
  } catch (e) {
    return res.status(502).send(
      "Tidak dapat terhubung ke layanan CloudAPK. Coba lagi beberapa saat kemudian."
    );
  }
}
