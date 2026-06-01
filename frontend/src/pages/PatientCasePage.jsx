export default function PatientCasePage({
  patientCase,
  onPatientCaseChange,
  loading,
  onStart,
}) {
  return (
    <div className="card">
      <h2>Écran 1 — Cas patient</h2>
      <label htmlFor="case">Décrivez le cas (symptômes, contexte)</label>
      <textarea
        id="case"
        rows={6}
        value={patientCase}
        onChange={(e) => onPatientCaseChange(e.target.value)}
        placeholder="Ex: Toux sèche depuis 3 jours, fatigue légère, pas de fièvre..."
      />
      <button
        disabled={loading || patientCase.length < 10}
        onClick={onStart}
      >
        Démarrer la consultation
      </button>
    </div>
  );
}
