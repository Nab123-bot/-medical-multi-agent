export function stepFromStatus(status) {
  if (status === "collecting_patient_answers") return 1;
  if (status === "awaiting_physician_review") return 2;
  if (status === "completed") return 3;
  return 0;
}
