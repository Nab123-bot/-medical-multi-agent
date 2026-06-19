import { useEffect, useState } from "react";
import { getReport, startConsultation, submitPatientAnswer, submitPhysicianReview } from "@/api/client";
import StepIndicator from "@/components/StepIndicator";
import { API_BASE, DISCLAIMER, STEPS } from "@/constants";
import FinalReportPage from "@/pages/FinalReportPage";
import PatientCasePage from "@/pages/PatientCasePage";
import PatientQuestionsPage from "@/pages/PatientQuestionsPage";
import PhysicianReviewPage from "@/pages/PhysicianReviewPage";
import { stepFromStatus } from "@/utils/consultation";

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
    if (data.final_report) setReport(data.final_report);
  }

  async function handleStartCase() {
    setError(""); setLoading(true);
    try { const data = await startConsultation(patientCase); applyConsultation(data); }
    catch (e) { setError(e.message.includes("fetch") ? "API inaccessible. Lancez le backend." : e.message); }
    finally { setLoading(false); }
  }

  async function handlePatientAnswer() {
    if (!consultation?.thread_id) return;
    setError(""); setLoading(true);
    try { const data = await submitPatientAnswer(consultation.thread_id, answer.trim()); setAnswer(""); applyConsultation(data); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handlePhysicianReview() {
    if (!consultation?.thread_id) return;
    setError(""); setLoading(true);
    try {
      const data = await submitPhysicianReview(consultation.thread_id, physicianInput.trim());
      applyConsultation(data);
      if (!data.final_report && data.status === "completed") {
        const rep = await getReport(consultation.thread_id);
        setReport(rep.final_report); setStep(3);
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  function reset() {
    setStep(0); setConsultation(null); setReport("");
    setPatientCase(""); setAnswer(""); setPhysicianInput(""); setError("");
  }

  const c = consultation;

  return (
    <div className="app">
      <div className="app-header">
        <div className="app-header-left">
          <div className="app-logo">⚕</div>
          <div>
            <div className="app-title">MediAgent</div>
            <div className="app-subtitle">système multi-agents · LangGraph</div>
          </div>
        </div>
        <div className="api-status">
          <div className={`api-dot${apiOk === true ? " online" : apiOk === false ? " offline" : ""}`} />
          {apiOk === true ? "API en ligne" : apiOk === false ? "API hors ligne" : "Vérification…"}
        </div>
      </div>

      <div className="disclaimer">{DISCLAIMER}</div>
      <StepIndicator steps={STEPS} currentStep={step} />
      {loading && <div className="loading-bar" />}

      {step === 0 && <PatientCasePage patientCase={patientCase} onPatientCaseChange={setPatientCase} loading={loading} onStart={handleStartCase} />}
      {step === 1 && c?.status === "collecting_patient_answers" && <PatientQuestionsPage consultation={c} answer={answer} onAnswerChange={setAnswer} loading={loading} onSubmit={handlePatier} />}
      {step === 1 && c?.status !== "collecting_patient_answers" && (
        <div className="card"><p style={{color:"var(--text-secondary)"}}>État inattendu : {c?.status}</p><div className="btn-row"><button className="btn btn-secondary" onClick={reset}>← Recommencer</button></div></div>
      )}
      {step === 2 && c?.status === "awaiting_physician_review" && <PhysicianReviewPage consultation={c} physicianInput={physicianInput} onPhysicianInputChange={setPhysicianInput} loading={loading} onSubmit={handlePhysicianReview} />}
      {step === 3 && <FinalReportPage report={report} consultation={c} onReset={reset} />}
      {step > 0 && step < 3 && !loading && !c && (
        <div className="card"><p style={{color:"var(--text-secondary)"}}>État perdu.</p><div className="btn-row"><button className="btn btn-secondary" onClick={reset}>← Recommencer</button></div></div>
      )}
      {error && <div className="alert alert-error"><span>⚠</span><span>{error}</span></div>}
      <div className="hint">P<code>/Users/macbookair/Projects/medical-multi-agent</code> · Backend : <code>uvicorn app.api:app --port 8000</code></div>
    </div>
  );
}
