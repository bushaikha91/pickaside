function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY || "";
  const from = process.env.WELCOME_FROM_EMAIL || "Pick A Side <onboarding@resend.dev>";
  if (!apiKey) {
    res.status(200).json({ sent: false, skipped: true, reason: "RESEND_API_KEY is not configured" });
    return;
  }

  try {
    const email = String(req.body?.email || "").trim();
    const displayName = String(req.body?.displayName || req.body?.username || "لاعب Pick A Side").trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "Valid email is required" });
      return;
    }

    const safeName = escapeHtml(displayName);
    const providerResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: email,
        subject: "تم إنشاء حسابك في Pick A Side",
        html: `
          <div dir="rtl" style="font-family:Arial,sans-serif;background:#12131a;color:#fff;padding:24px">
            <div style="max-width:520px;margin:auto;background:#1c1e27;border-radius:18px;padding:24px;border:1px solid rgba(255,255,255,.08)">
              <h1 style="margin:0 0 12px;font-size:24px">مرحباً ${safeName}</h1>
              <p style="margin:0 0 16px;line-height:1.8;color:#d8d8d8">تم إنشاء حسابك بنجاح في Pick A Side.</p>
              <p style="margin:0 0 22px;line-height:1.8;color:#d8d8d8">تقدر الآن تنضم للبطولات، تصوّت على المباريات، وتتابع ترتيبك ونقاطك مباشرة.</p>
              <a href="https://www.pickaside.mobile/" style="display:inline-block;background:#d5ff40;color:#111;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:700">فتح التطبيق</a>
            </div>
          </div>
        `
      })
    });

    const result = await providerResponse.json().catch(() => ({}));
    if (!providerResponse.ok) {
      res.status(providerResponse.status).json({ sent: false, error: result.message || "Email provider error" });
      return;
    }

    res.status(200).json({ sent: true, id: result.id || "" });
  } catch (error) {
    res.status(500).json({ sent: false, error: error.message || "Unable to send welcome email" });
  }
};
