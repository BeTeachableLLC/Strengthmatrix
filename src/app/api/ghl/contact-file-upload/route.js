export const runtime = "nodejs";

function jsonError(message, status = 400, extra) {
  return Response.json(
    { ok: false, error: message, ...(extra ? { extra } : {}) },
    { status }
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

export async function POST(request) {
  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const locationId = String(process.env.GHL_LOCATION_ID || "").trim();
  const customFieldId = process.env.GHL_FILE_UPLOAD_CUSTOM_FIELD_ID;
  const apiBaseUrl =
    process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";

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

  const contactId = form.get("contactId");
  if (!contactId || typeof contactId !== "string") {
    return jsonError("Missing field: contactId");
  }
  const normalizedContactId = contactId.trim();
  if (!normalizedContactId) {
    return jsonError("Invalid field: contactId");
  }

  const file = form.get("file");
  if (!file || typeof file === "string") {
    return jsonError("Missing field: file (PDF)");
  }
  const fullName = form.get("fullName");
  const fileUserName =
    typeof fullName === "string" && fullName.trim() ? fullName : normalizedContactId;

  const fileId = crypto.randomUUID();
  const uploadedFileName = buildTimestampedPdfName(
    file.name || "result.pdf",
    fileUserName
  );
  const uploadForm = new FormData();
  // HighLevel requires key: <custom_field_id>_<file_id>
  uploadForm.set(`${customFieldId}_${fileId}`, file, uploadedFileName);

  const uploadUrl = `${apiBaseUrl}/forms/upload-custom-files?locationId=${encodeURIComponent(
    locationId
  )}&contactId=${encodeURIComponent(normalizedContactId)}`;

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Version: "2021-07-28",
    },
    body: uploadForm,
  });

  const text = await res.text();
  if (!res.ok) {
    return jsonError("HighLevel upload failed", res.status, { body: text });
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  return Response.json({
    ok: true,
    contactId: normalizedContactId,
    uploaded: true,
    uploadedFileName,
    data,
  });
}

