export const runtime = "nodejs";

function jsonError(message, status = 400, extra) {
  return Response.json(
    { ok: false, error: message, ...(extra ? { extra } : {}) },
    { status }
  );
}

function extractContactId(payload) {
  if (!payload || typeof payload !== "object") return null;
  return (
    payload?.id ||
    payload?.contactId ||
    payload?.contact?.id ||
    payload?.data?.id ||
    payload?.data?.contactId ||
    payload?.data?.contact?.id ||
    null
  );
}

export async function POST(request) {
  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  const apiBaseUrl =
    process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";

  if (!token) return jsonError("Missing env: GHL_PRIVATE_INTEGRATION_TOKEN", 500);
  if (!locationId) return jsonError("Missing env: GHL_LOCATION_ID", 500);

  let payload;
  try {
    payload = await request.json();
  } catch (e) {
    return jsonError("Invalid JSON body", 400, { message: String(e) });
  }

  if (!payload?.email && !payload?.phone) {
    return jsonError("Payload must include at least email or phone");
  }

  const body = {
    locationId,
    name: payload.fullName || payload.name || "",
    email: payload.email || "",
    phone: payload.phone || "",
  };

  const res = await fetch(`${apiBaseUrl}/contacts/upsert`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Version: "2021-07-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    return jsonError("Contact upsert failed", res.status, data);
  }

  const contactId = extractContactId(data);
  if (!contactId) {
    return jsonError("Could not read contactId from upsert response", 500, data);
  }

  return Response.json({ ok: true, contactId, data });
}

