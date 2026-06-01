import { useEffect, useState } from "react";
import {
  getReport,
  startConsultation,
  submitPatientAnswer,
  submitPhysicianReview,
} from "@/api/client";
import StepIndicator from "@/components/StepIndicator";
import { API_BASE, DISCLAIMER, STEPS } from "@/constants";
import FinalReportPage from "@/pages/FinalReportPage";
import LostConsultationPage from "@/pages/LostConsultationPage";
import PatientCasePage from "@/pages/PatientCasePage";
import PatientQuestionsPage from "@/pages/PatientQuestionsPage";
import PhysicianReviewPage from "@/pages/PhysicianReviewPage";
import UnexpectedStatePage from "@/pages/UnexpectedStatePage";
import { stepFromStatus } from "@/utils/consultation";
import "@/index.css";

export default function App() {
  const [step, setStep] = useState(0);
  const [consultation, setConsultation] = useState(null);
  const [patientCase, setPatientCase] = useState("");
  const [answer, setAnswer] = useState("");
  const [physicianInput, setPhysicianInput] = useState("");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiOk, setApiOk] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((r) => r.json().then((d) => setApiOk(d?.status === "ok")))
      .catch(() => setApiOk(false));
  }, []);

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

      <StepIndicator steps={STEPS} currentStep={step} />

      {loading && <p className="loading">Chargement…</p>}

      {apiOk === false && (
        <p className="error">
          Backend non accessible ({API_BASE}). Lancez :{" "}
          <code>cd backend && source .venv/bin/activate && uvicorn app.api:app --port 8000</code>
        </p>
      )}

      {step === 0 && (
        <PatientCasePage
          patientCase={patientCase}
          onPatientCaseChange={setPatientCase}
          loading={loading}
          onStart={handleStartCase}
        />
      )}

      {step === 1 && c?.status !== "collecting_patient_answers" && (
        <UnexpectedStatePage status={c?.status} onReset={reset} />
      )}

      {step === 1 && c?.status === "collecting_patient_answers" && (
        <PatientQuestionsPage
          consultation={c}
          answer={answer}
          onAnswerChange={setAnswer}
          loading={loading}
          onSubmit={handlePatientAnswer}
        />
      )}

      {step === 2 && c?.status === "awaiting_physician_review" && (
        <PhysicianReviewPage
          consultation={c}
          physicianInput={physicianInput}
          onPhysicianInputChange={setPhysicianInput}
          loading={loading}
          onSubmit={handlePhysicianReview}
        />
      )}

      {step === 3 && (
        <FinalReportPage
          report={report}
          consultation={c}
          onReset={reset}
        />
      )}

      {step > 0 && step < 3 && !loading && !c && (
        <LostConsultationPage onReset={reset} />
      )}

      {error && <p className="error">{error}</p>}

      <p className="hint">
        Code du projet :{" "}
        <code>/Users/macbookair/Projects/medical-multi-agent</code>
      </p>
    </div>
  );
}
