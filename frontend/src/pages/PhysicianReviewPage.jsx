export default function PhysicianReviewPage({
  consultation,
  physicianInput,
  onPhysicianInputChange,
  loading,
  onSubmit,
}) {
  const c = consultation;
  return (
    <div className="card">
      <h2>Écran 3 — Revue médecin (Human-in-the-loop)</h2>
      <h3>Synthèse clinique préliminaire</h3>
      <pre className="report">{c.diagnostic_summary}</pre>
      <h3>Recommandation intermédiaire</h3>
      <pre className="report">{c.interim_care}</pre>
      <label htmlFor="physician">Conduite à tenir / traitement proposé</label>
      <textarea
        id="physician"
        rows={4}
        value={physicianInput}
        onChange={(e) => onPhysicianInputChange(e.target.value)}
        placeholder="Validation ou ajustement par le médecin traitant"
      />
      <button
        disabled={loading || physicianInput.trim().length < 5}
        onClick={onSubmit}
      >
        Valider et générer le rapport
      </button>
    </div>
  );
}
