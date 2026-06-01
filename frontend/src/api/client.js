import { API_BASE } from "@/constants";

const BASE = API_BASE;

async function parseError(res) {
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    if (json.detail) {
      return typeof json.detail === "string"
        ? json.detail
        : JSON.stringify(json.detail);
    }
  } catch {
    /* ignore */
  }
  return text || `Erreur HTTP ${res.status}`;
}

export async function startConsultation(patientCase) {
  const res = await fetch(`${BASE}/consultation/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patient_case: patientCase }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function submitPatientAnswer(threadId, answer) {
  const res = await fetch(`${BASE}/consultation/resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ thread_id: threadId, answer }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function submitPhysicianReview(threadId, physicianTreatment) {
  const res = await fetch(`${BASE}/consultation/resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      thread_id: threadId,
      physician_treatment: physicianTreatment,
    }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getReport(threadId) {
  const res = await fetch(`${BASE}/consultation/${threadId}/report`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
