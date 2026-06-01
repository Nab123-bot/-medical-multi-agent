export default function UnexpectedStatePage({ status, onReset }) {
  return (
    <div className="card">
      <p>État inattendu : {status || "inconnu"}</p>
      <button type="button" onClick={onReset}>
        Recommencer
      </button>
    </div>
  );
}
