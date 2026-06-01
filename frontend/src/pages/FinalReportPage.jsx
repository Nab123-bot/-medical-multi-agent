export default function FinalReportPage({ report, consultation, onReset }) {
  return (
    <div className="card">
      <h2>Écran 4 — Rapport final</h2>
      <pre className="report">{report || consultation?.final_report}</pre>
      <button type="button" className="secondary" onClick={onReset}>
        Nouvelle consultation
      </button>
    </div>
  );
}
