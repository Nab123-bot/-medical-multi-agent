export default function LostConsultationPage({ onReset }) {
  return (
    <div className="card">
      <p>État de consultation perdu. Recommencez une nouvelle consultation.</p>
      <button type="button" onClick={onReset}>
        Recommencer
      </button>
    </div>
  );
}
