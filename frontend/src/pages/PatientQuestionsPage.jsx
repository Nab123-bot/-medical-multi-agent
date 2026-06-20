export default function PatientQuestionsPage({ consultation, answer, onAnswerChange, loading, onSubmit }) {
  const c = consultation;
  const total = 5;
  const current = c.question_count;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">💬</div>
        <div>
          <div className="card-title">Questions patient</div>
          <div className="card-subtitle">Question {current + 1} sur {total}</div>
        </div>
      </div>

      <div className="q-progress">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={"q-dot" + (i < current ? " answered" : i === current ? " current" : "")} />
        ))}
      </div>

      <div className="question-bubble">
        <div className="question-meta">Agent diagnostic · question {current + 1}/{total}</div>
        <div className="question-text">{c.current_question}</div>
      </div>

      {c.patient_answers && c.patient_answers.length > 0 && (
        <div style={{ marginBottom: "1.25rem" }}>
          <div className="section-label">Réponses précédentes</div>
          {c.patient_answers.map(function(a, i) {
            return (
              <div key={i} className="clinical-block" style={{ marginBottom: "0.5rem" }}>
                <div className="question-meta">Q{a.index} — {a.question}</div>
                <div className="clinical-content">↳ {a.answer}</div>
              </div>
            );
          })}
        </div>
      )}

      <label htmlFor="answer">Votre réponse</label>
      <textarea
        id="answer"
        rows={3}
        value={answer}
        onChange={function(e) { onAnswerChange(e.target.value); }}
        placeholder="Répondez à la question ci-dessus…"
      />
      <div className="btn-row">
        <button
          className="btn btn-primary"
          disabled={loading || !answer.trim()}
          onClick={onSubmit}
        >
          {loading ? "Envoi…" : current < total - 1 ? "Réponse suivante →" : "Terminer les questions →"}
        </button>
      </div>
    </div>
  );
}
