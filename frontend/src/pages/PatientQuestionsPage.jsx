export default function PatientQuestionsPage({
  consultation,
  answer,
  onAnswerChange,
  loading,
  onSubmit,
}) {
  const c = consultation;
  return (
    <div className="card">
      <h2>
        Écran 2 — Questions patient ({c.question_count + 1}/5)
      </h2>
      <p>{c.current_question}</p>
      <label htmlFor="answer">Votre réponse</label>
      <input
        id="answer"
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Réponse du patient"
        onKeyDown={(e) =>
          e.key === "Enter" && answer.trim() && onSubmit()
        }
      />
      <button disabled={loading || !answer.trim()} onClick={onSubmit}>
        Envoyer la réponse
      </button>
    </div>
  );
}
