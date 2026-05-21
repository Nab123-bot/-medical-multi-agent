import { useState } from "react";
import {
  getReport,
  startConsultation,
  submitPatientAnswer,
  submitPhysicianReview,
} from "./api/client";

const STEPS = [
  "Cas patient",
  "Questions patient",
  "Revue médecin",
  "Rapport final",
];

const DISCLAIMER =
  "Exercice pédagogique — ce système ne remplace pas une consultation médicale.";

function stepFromStatus(status) {
  if (status === "collecting_patient_answers") return 1;
  if (status === "awaiting_physician_review") return 2;
  if (status === "completed") return 3;
  return 0;
}

export default function App() {
  const [step, setStep] = useState(0);
  const [consultation, setConsultation] = useState(null);
  const [patientCase, setPatientCase] = useState("");
  const [answer, setAnswer] = useState("");
  const [physicianInput, setPhysicianInput] = useState("");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function applyConsultation(data) {
    setConsultation(data);
    setStep(stepFromStatus(data.status));
    if (data.final_report) {
      setReport(data.final_report);
    }
  }

  async function handleStartCase() {
    setError("");
    setLoading(true);
    try {
      const data = await startConsultation(patientCase);
      applyConsultation(data);
    } catch (e) {
      setError(
        e.message.includes("fetch")
          ? "API inaccessible. Lancez le backend : cd backend && source .venv/bin/activate && uvicorn app.api:app --port 8000"
          : e.message
      );
    } finally {
      setLoading(false);
    }
  }

  async function handlePatientAnswer() {
    if (!consultation?.thread_id) return;
    setError("");
    setLoading(true);
    try {
      const data = await submitPatientAnswer(
        consultation.thread_id,
        answer.trim()
      );
      setAnswer("");
      applyConsultation(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePhysicianReview() {
    if (!consultation?.thread_id) return;
    setError("");
    setLoading(true);
    try {
      const data = await submitPhysicianReview(
        consultation.thread_id,
        physicianInput.trim()
      );
      applyConsultation(data);
      if (data.final_report) {
        setReport(data.final_report);
      } else if (data.status === "completed") {
        const rep = await getReport(consultation.thread_id);
        setReport(rep.final_report);
        setStep(3);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep(0);
    setConsultation(null);
    setReport("");
    setPatientCase("");
    setAnswer("");
    setPhysicianInput("");
    setError("");
  }

  const c = consultation;

  return (
    <div className="app">
      <h1>Orientation clinique préliminaire</h1>
      <p className="disclaimer">{DISCLAIMER}</p>

      <div className="steps">
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={`step ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}
          >
            {i + 1}. {label}
          </span>
        ))}
      </div>

      {loading && <p className="loading">Chargement…</p>}

      {step === 0 && (
        <div className="card">
          <h2>Écran 1 — Cas patient</h2>
          <label htmlFor="case">Décrivez le cas (symptômes, contexte)</label>
          <textarea
            id="case"
            rows={6}
            value={patientCase}
            onChange={(e) => setPatientCase(e.target.value)}
            placeholder="Ex: Toux sèche depuis 3 jours, fatigue légère, pas de fièvre..."
          />
          <button
            disabled={loading || patientCase.length < 10}
            onClick={handleStartCase}
          >
            Démarrer la consultation
          </button>
        </div>
      )}

      {step === 1 && c?.status === "collecting_patient_answers" && (
        <div className="card">
          <h2>
            Écran 2 — Questions patient ({c.question_count + 1}/5)
          </h2>
          <p>{c.current_question}</p>
          <label htmlFor="answer">Votre réponse</label>
          <input
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Réponse du patient"
            onKeyDown={(e) => e.key === "Enter" && answer.trim() && handlePatientAnswer()}
          />
          <button
            disabled={loading || !answer.trim()}
            onClick={handlePatientAnswer}
          >
            Envoyer la réponse
          </button>
        </div>
      )}

      {step === 2 && c?.status === "awaiting_physician_review" && (
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
            onChange={(e) => setPhysicianInput(e.target.value)}
            placeholder="Validation ou ajustement par le médecin traitant"
          />
          <button
            disabled={loading || physicianInput.trim().length < 5}
            onClick={handlePhysicianReview}
          >
            Valider et générer le rapport
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <h2>Écran 4 — Rapport final</h2>
          <pre className="report">{report || c?.final_report}</pre>
          <button type="button" className="secondary" onClick={reset}>
            Nouvelle consultation
          </button>
        </div>
      )}

      {step > 0 && step < 3 && !loading && !c && (
        <div className="card">
          <p>État de consultation perdu. Recommencez une nouvelle consultation.</p>
          <button type="button" onClick={reset}>
            Recommencer
          </button>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      <p className="hint">
        Code du projet :{" "}
        <code>/Users/macbookair/Projects/medical-multi-agent</code>
      </p>
    </div>
  );
}
