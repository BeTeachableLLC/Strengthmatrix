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

function sanitizeFilePart(value, fallback = "user") {
  const cleaned = String(value || "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "");
  return cleaned || fallback;
}

function getEstTimestampForFileName() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(new Date());

  const get = (type) => parts.find((part) => part.type === type)?.value || "";
  const month = get("month");
  const day = get("day");
  const year = get("year");
  const hour = get("hour");
  const minute = get("minute");
  const dayPeriod = get("dayPeriod").toUpperCase();

  return `${month}-${day}-${year}_${hour}-${minute}-${dayPeriod}_EST`;
}

function buildTimestampedPdfName(originalName = "result.pdf", username = "user") {
  const safeBase = String(originalName || "result.pdf").replace(/\.[^/.]+$/, "");
  const safeUser = sanitizeFilePart(username, "user");
  const stamp = getEstTimestampForFileName();
  return `${safeUser}-${safeBase}-${stamp}.pdf`;
}

async function upsertContact({ apiBaseUrl, token, locationId, payload }) {
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
    return { ok: false, status: res.status, data };
  }

  const contactId = extractContactId(data);
  if (!contactId) {
    return { ok: false, status: 500, data, error: "Could not read contactId" };
  }

  return { ok: true, contactId, data };
}

async function uploadPdfToCustomField({
  apiBaseUrl,
  token,
  locationId,
  customFieldId,
  contactId,
  file,
  username,
}) {
  const fileId = crypto.randomUUID();
  const uploadedFileName = buildTimestampedPdfName(
    file.name || "result.pdf",
    username || contactId
  );
  const uploadForm = new FormData();
  uploadForm.set("locationId", locationId);
  uploadForm.set("contactId", contactId);
  uploadForm.set(`${customFieldId}_${fileId}`, file, uploadedFileName);

  const res = await fetch(`${apiBaseUrl}/forms/upload-custom-files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Version: "2021-07-28",
    },
    body: uploadForm,
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  return { ok: res.ok, status: res.status, data, uploadedFileName };
}

async function triggerWorkflowWebhook(webhookUrl, payload) {
  if (!webhookUrl) return { skipped: true };
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, body: text };
}

export async function POST(request) {
  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  const customFieldId = process.env.GHL_FILE_UPLOAD_CUSTOM_FIELD_ID;
  const apiBaseUrl =
    process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";
  const webhookUrl = process.env.GHL_WORKFLOW_WEBHOOK_URL;

  if (!token) return jsonError("Missing env: GHL_PRIVATE_INTEGRATION_TOKEN", 500);
  if (!locationId) return jsonError("Missing env: GHL_LOCATION_ID", 500);
  if (!customFieldId)
    return jsonError("Missing env: GHL_FILE_UPLOAD_CUSTOM_FIELD_ID", 500);

  let form;
  try {
    form = await request.formData();
  } catch (e) {
    return jsonError("Expected multipart/form-data", 415, { message: String(e) });
  }

  const payloadRaw = form.get("payload");
  const file = form.get("file");

  if (!payloadRaw || typeof payloadRaw !== "string") {
    return jsonError("Missing field: payload (JSON string)");
  }
  if (!file || typeof file === "string") {
    return jsonError("Missing field: file (PDF)");
  }

  let payload;
  try {
    payload = JSON.parse(payloadRaw);
  } catch {
    return jsonError("Invalid JSON in payload");
  }

  if (!payload?.email && !payload?.phone) {
    return jsonError("Payload must include at least email or phone");
  }

  const upsert = await upsertContact({ apiBaseUrl, token, locationId, payload });
  if (!upsert.ok) {
    return jsonError("Contact upsert failed", upsert.status || 500, upsert);
  }

  const upload = await uploadPdfToCustomField({
    apiBaseUrl,
    token,
    locationId,
    customFieldId,
    contactId: upsert.contactId,
    file,
    username: payload.fullName || payload.name || upsert.contactId,
  });
  if (!upload.ok) {
    return jsonError("PDF upload failed", upload.status || 500, {
      contactId: upsert.contactId,
      upload,
    });
  }

  const webhook = await triggerWorkflowWebhook(webhookUrl, payload);

  return Response.json({
    ok: true,
    contactId: upsert.contactId,
    upsert,
    upload,
    workflowWebhook: webhook,
  });
}

